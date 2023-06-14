import { UsersRepository } from '../users/users.repository';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInputModelType } from '../users/sa.users.controller';
import { DTOFactory } from '../helpers/DTO.factory';
import { EmailManager } from '../managers/email-manager';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { CustomisableException } from '../exceptions/custom.exceptions';
import { BcryptService } from '../other.services/bcrypt.service';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { settings } from '../settings';
import { UserDeviceDBType } from '../usersDevices/users-devices.types';
import { UsersDevicesRepository } from '../usersDevices/usersDevicesRepository';
import * as process from 'process';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly dtoFactory: DTOFactory,
    private readonly emailManager: EmailManager,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly usersDeviceRepository: UsersDevicesRepository,
  ) {}
  async BasicAuthorization(authHeader): Promise<boolean> {
    const authType = authHeader.split(' ')[0];
    if (authType !== 'Basic') {
      throw new UnauthorizedException();
    }
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');
    const user = auth[0];
    const pass = auth[1];
    if (!(user == 'admin' && pass == 'qwerty')) {
      throw new UnauthorizedException();
    }
    return true;
  }

  async checkUserCredential(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user || user.isBanned === true) {
      return null;
    }
    const userHash = user.passwordHash;
    const isPasswordValid = await this.bcryptService.comparePassword(
      password,
      userHash,
    );
    if (!isPasswordValid) {
      return null;
    }
    return user._id.toString();
  }



  async refreshingToken(userId, deviceId) {
    const { accessToken, refreshToken } = await this.createTokens(
      userId,
      deviceId.toString(),
    );
    const lastActiveDate = await this.getLastActiveDateFromToken(refreshToken);
    const expirationDate = await this.getExpirationDateFromRefreshToken(
      refreshToken,
    );
    await this.usersDeviceRepository.refreshDeviceInfo(
      deviceId,
      lastActiveDate,
      expirationDate,
    );
    return { accessToken, refreshToken };
  }
  async passwordRecovery(email: string): Promise<boolean> {
    const passwordRecoveryData = {
      email: email,
      passwordRecoveryCode: uuidv4(),
      expirationDateOfRecoveryCode: add(new Date(), {
        hours: 1,
        //minutes: 3
      }),
    };
    try {
      await this.emailManager.sendPasswordRecoveryMessage(passwordRecoveryData);
    } catch (e) {
      return false;
    }
    const result = await this.usersRepository.addPasswordRecoveryData(
      passwordRecoveryData,
    );
    return result;
  }
  async newPasswordSet(newPasswordDTO): Promise<boolean> {
    const user = await this.usersRepository.getUserByPasswordRecoveryCode(
      newPasswordDTO.recoveryCode,
    );
    if (!user) return false;
    if (user.expirationDateOfRecoveryCode! < new Date()) {
      return false;
    }
    const passwordHash = await this.bcryptService.hashPassword(
      newPasswordDTO.newPassword,
    );
    user.passwordHash = passwordHash;
    user.passwordRecoveryCode = null;
    user.expirationDateOfRecoveryCode = null;
    const result = user.save();
    return !!result;
  }
  async logout(user): Promise<boolean> {
    const isDeviceDeleted =
      await this.usersDeviceRepository.deleteDeviceByUserAndDeviceId(
        user.userId,
        user.deviceId,
      );
    return isDeviceDeleted;
  }
}

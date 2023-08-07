import { UsersRepository } from '../users/users.repository';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BcryptService } from '../other.services/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
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
    const user = await this.usersRepository.getUserForLoginByLoginOrEmail(
      loginOrEmail,
    );
    
    if (!user || user.isUserBanned === true) {
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
    return user.id;
  }
}

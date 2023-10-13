import { UserDBType } from '../users/users.types';
import { BcryptService } from '../other.services/bcrypt.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DTOFactory {
  constructor(private readonly bcryptService: BcryptService) {}
  async createUserDTO(createUserData: createUserDataType) {
    const passwordHash = await this.bcryptService.hashPassword(
      createUserData.password,
    );
    const userDTO = new UserDBType(
      uuidv4(),
      createUserData.login,
      passwordHash,
      createUserData.email,
      new Date().toISOString(),
      false,
      null,
      null,
      createUserData.confirmationCode || null,
      createUserData.expirationDateOfConfirmationCode || null,
      createUserData.isConfirmed || false,
      null,
      null,
    );
    return userDTO;
  }
}

type createUserDataType = {
  login: string;
  password: string;
  email: string;
  isConfirmed?: boolean;
  confirmationCode?: string;
  expirationDateOfConfirmationCode?: Date;
};

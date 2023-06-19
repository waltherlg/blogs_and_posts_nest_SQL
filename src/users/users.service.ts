import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async deleteUserById(userId: string): Promise<boolean> {
    return await this.usersRepository.deleteUserById(userId);
  }
}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { newPasswordSetInput } from "src/auth/auth.controller";
import { BcryptService } from "src/other.services/bcrypt.service";
import { UsersRepository } from "src/users/users.repository";

export class NewPasswordSetCommand {
    constructor(public newPasswordSetDto: newPasswordSetInput){}
}

@CommandHandler(NewPasswordSetCommand)
export class NewPasswordSetUseCase implements ICommandHandler<NewPasswordSetCommand>{
    constructor(private readonly usersRepository: UsersRepository,
        private readonly bcryptService: BcryptService){}
    async execute(command: NewPasswordSetCommand): Promise<boolean> {
        const newPasswordHash = await this.bcryptService.hashPassword(
            command.newPasswordSetDto.newPassword,
          );
          const result = await this.usersRepository.newPasswordSet(command.newPasswordSetDto.recoveryCode, newPasswordHash)
     
          return result       
    }
}

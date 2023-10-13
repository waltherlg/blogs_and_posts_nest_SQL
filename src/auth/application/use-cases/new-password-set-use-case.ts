import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { newPasswordSetInput } from "../../../auth/auth.controller";
import { BcryptService } from "../../../other.services/bcrypt.service";
import { UsersRepository } from "../../../users/users.repository";

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

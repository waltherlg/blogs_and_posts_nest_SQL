import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../users/users.repository";

export class RegisterationConfirmaitonCommand {
    constructor(public confirmationCode){}
}

@CommandHandler(RegisterationConfirmaitonCommand)
export class RegisterationConfirmaitonUseCase implements ICommandHandler<RegisterationConfirmaitonCommand>{
    constructor(private readonly usersRepository: UsersRepository){}
    async execute(command: RegisterationConfirmaitonCommand): Promise<any> {
          const result = await this.usersRepository.confirmUser(command.confirmationCode)
          return result       
    }
}
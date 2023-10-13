import { DTOFactory } from './../../../helpers/DTO.factory';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../users/users.repository";
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../managers/email-manager';

export class RegisterUserCommand {
    constructor(public registerUserDto){}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand>{
    constructor(private readonly usersRepository: UsersRepository,
        private readonly dtoFactory: DTOFactory,
        private readonly emailManager: EmailManager){}
    async execute(command: RegisterUserCommand): Promise<any> {

        const registerUserData = {
            ...command.registerUserDto,
            confirmationCode: uuidv4(),
            expirationDateOfConfirmationCode: add(new Date(), {
              hours: 1,
              //minutes: 3
            }),
          };
        const userDTO = await this.dtoFactory.createUserDTO(registerUserData);
        try {
            await this.emailManager.sendEmailConfirmationMessage(registerUserData);
          } catch (e) {
            return false;
          }
        const newUserId = await this.usersRepository.createUser(userDTO)  
              
        return newUserId
    }
}
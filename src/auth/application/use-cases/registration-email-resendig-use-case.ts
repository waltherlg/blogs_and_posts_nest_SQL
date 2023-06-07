import { DTOFactory } from './../../../helpers/DTO.factory';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "src/users/users.repository";
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from 'src/managers/email-manager';
import { CustomisableException } from 'src/exceptions/custom.exceptions';

export class RegisterationEmailResendingCommand {
    constructor(public refreshConfirmationDto){}
}

@CommandHandler(RegisterationEmailResendingCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterationEmailResendingCommand>{
    constructor(private readonly usersRepository: UsersRepository,
        private readonly dtoFactory: DTOFactory,
        private readonly emailManager: EmailManager){}
    async execute(command: RegisterationEmailResendingCommand): Promise<any> {

        const refreshConfirmationData = {
            email: command.refreshConfirmationDto.email,
            confirmationCode: uuidv4(),
          };
          try {
            await this.emailManager.resendEmailConfirmationMessage(
              refreshConfirmationData,
            );
          } catch (error) {
            throw new CustomisableException(
              'email',
              'the application failed to send an email',
              400,
            );
          }
          
          const user = await this.usersRepository.findUserByLoginOrEmail(email);
          user.confirmationCode = refreshConfirmationData.confirmationCode;
          user.expirationDateOfConfirmationCode = add(new Date(), {
            hours: 1,
            //minutes: 3
          });
          return await this.usersRepository.saveUser(user);
    }
}
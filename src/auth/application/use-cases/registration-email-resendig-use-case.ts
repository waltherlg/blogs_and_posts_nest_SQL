import { DTOFactory } from './../../../helpers/DTO.factory';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../users/users.repository";
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../managers/email-manager';
import { CustomisableException } from '../../../exceptions/custom.exceptions';

export class RegisterationEmailResendingCommand {
    constructor(public email){}
}

@CommandHandler(RegisterationEmailResendingCommand)
export class RegisterationEmailResendingUseCase implements ICommandHandler<RegisterationEmailResendingCommand>{
    constructor(private readonly usersRepository: UsersRepository,
        private readonly dtoFactory: DTOFactory,
        private readonly emailManager: EmailManager){}
    async execute(command: RegisterationEmailResendingCommand): Promise<any> {

        const refreshConfirmationData = {
            email: command.email,
            expirationDateOfConfirmationCode: add(new Date(), {
              hours: 1,
              //minutes: 3
            }),
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
              299,
            );
          }

          const result = await this.usersRepository.refreshConfirmationData(refreshConfirmationData)
          return result
        
    }
}
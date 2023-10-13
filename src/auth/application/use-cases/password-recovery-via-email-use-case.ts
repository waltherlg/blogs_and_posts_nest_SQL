import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryEmailInput } from './../../auth.controller';
import { UsersRepository } from '../../../users/users.repository';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { EmailManager } from '../../../managers/email-manager';


export class PasswordRecoveryViaEmailCommand{
    constructor(public PasswordRecoveryDto: PasswordRecoveryEmailInput){}
}

@CommandHandler(PasswordRecoveryViaEmailCommand)
export class PasswordRecoveryEmailUseCase implements ICommandHandler<PasswordRecoveryViaEmailCommand>{
    constructor(private readonly usersRepository: UsersRepository,
        private readonly emailManager: EmailManager){}
    async execute(command: PasswordRecoveryViaEmailCommand): Promise<boolean> {
        const passwordRecoveryData = {
            email: command.PasswordRecoveryDto.email,
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
}
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryEmailInput } from './../../auth.controller';
import { UsersRepository } from 'src/users/users.repository';


export class PasswordRecoveryViaEmailCommand{
    constructor(public PasswordRecoveryDto){}
}

@CommandHandler(PasswordRecoveryViaEmailCommand)
export class PasswordRecoveryEmailUseCase implements ICommandHandler<PasswordRecoveryViaEmailCommand>{
    constructor(private readonly usersRepository: UsersRepository){}
    async execute(command: PasswordRecoveryViaEmailCommand): Promise<any> {
        const passwordRecoveryData = {
            email: email,
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
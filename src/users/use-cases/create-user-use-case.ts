import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "src/users/users.repository";
import { UsersDevicesRepository } from "src/usersDevices/user.devices.repository";
import { CreateUserInputModelType } from "../sa.users.controller";
import { DTOFactory } from "src/helpers/DTO.factory";


export class CreateUserCommand {
    constructor(public userCreateInputDto: CreateUserInputModelType){}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand>{
    constructor(private readonly usersRepository: UsersRepository,
        private readonly dtoFactory: DTOFactory){}
    async execute(command: CreateUserCommand): Promise<any> {
        const userCreateModel = {
            ...command.userCreateInputDto,
            isConfirmed: true,
          };
          const userDTO = await this.dtoFactory.createUserDTO(userCreateModel);
          const newUsersId = await this.usersRepository.createUser(userDTO);
          return newUsersId;
    }
}
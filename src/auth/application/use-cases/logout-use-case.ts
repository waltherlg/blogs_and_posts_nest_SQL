import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "src/users/users.repository";
import { UsersDevicesRepository } from "src/usersDevices/user.devices.repository";


export class LogoutCommand {
    constructor(public user){}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand>{
    constructor(private readonly usersDeviceRepository: UsersDevicesRepository){}
    async execute(command: LogoutCommand): Promise<any> {
        const isDeviceDeleted =
        await this.usersDeviceRepository.deleteDeviceByUserAndDeviceId(
            command.user.userId,
            command.user.deviceId,
        );
      return isDeviceDeleted;
    }
}
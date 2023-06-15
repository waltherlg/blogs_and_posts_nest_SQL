import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokensService } from "src/other.services/tokens.service";
import { UsersRepository } from "src/users/users.repository";
import { UserDeviceDBType } from "src/usersDevices/users-devices.types";
import { UsersDevicesRepository } from "src/usersDevices/usersDevicesRepository";
import { v4 as uuidv4 } from 'uuid';

export class LoginCommand {
    constructor(public userId: string, public ip: string, public userAgent: string  ){}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand>{
    constructor(private readonly tokensService: TokensService,
        private readonly usersDeviceRepository: UsersDevicesRepository,
        ){}
        async execute(command: LoginCommand): Promise<any> {
          //console.log('command.userId ', command.userId);
          
            const deviceId = uuidv4();
            const { accessToken, refreshToken } = await this.tokensService.createTokens(
              command.userId,
              deviceId,
            );
            const lastActiveDate = await this.tokensService.getLastActiveDateFromToken(refreshToken);
            const expirationDate = await this.tokensService.getExpirationDateFromRefreshToken(
              refreshToken,
            );
            const deviceInfoDto = new UserDeviceDBType(
              deviceId,
              command.userId,
              command.ip,
              command.userAgent,
              lastActiveDate,
              expirationDate,
            );
            await this.usersDeviceRepository.addDeviceInfo(deviceInfoDto)
            return { accessToken, refreshToken };
            
          }
}
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TokensService } from "../../../other.services/tokens.service";
import { UsersDevicesRepository } from "../../../usersDevices/user.devices.repository";

export class RefreshTokenCommand {
    constructor(public userId: string, public deviceId: string ){}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand>{
    constructor(private readonly tokensService: TokensService,
        private readonly usersDeviceRepository: UsersDevicesRepository){}
    async execute(command: RefreshTokenCommand) {
        const { accessToken, refreshToken } = await this.tokensService.createTokens(
            command.userId,
            command.deviceId,
          );
          const lastActiveDate = await this.tokensService.getLastActiveDateFromToken(refreshToken);
          const expirationDate = await this.tokensService.getExpirationDateFromRefreshToken(
            refreshToken,
          );
          await this.usersDeviceRepository.refreshDeviceInfo(
            command.deviceId,
            lastActiveDate,
            expirationDate,
          );
          return { accessToken, refreshToken };       
    }
}

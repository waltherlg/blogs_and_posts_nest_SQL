import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { newPasswordSetInput } from "src/auth/auth.controller";
import { BcryptService } from "src/other.services/bcrypt.service";
import { TokensService } from "src/other.services/tokens.service";
import { UsersRepository } from "src/users/users.repository";
import { UsersDevicesRepository } from "src/usersDevices/usersDevicesRepository";

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

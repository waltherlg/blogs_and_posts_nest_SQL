import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { settings } from '../../settings';
import { AuthService } from '../auth.service';
import { CustomisableException } from '../../exceptions/custom.exceptions';
import { CheckService } from '../../other.services/check.service';
import { UsersDeviceService } from '../../usersDevices/users-devices.service';
import { TokensService } from 'src/other.services/tokens.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly checkService: CheckService,
    private readonly usersDeviceService: UsersDeviceService,
  ) {
    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: settings.JWT_SECRET,
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['refreshToken'];
        }
        return null;
      },
    });
  }
  async validate(request: Request, payload: any) {
    if (!payload) {
      
      throw new UnauthorizedException();
    }
    const userId = payload.userId;
    if (!userId) {
      throw new CustomisableException('no access', 'no user in cookies', 401);
    }
    const deviceId = payload.deviceId;
    if (!deviceId) {
      throw new CustomisableException('no access', 'no device in cookies', 401);
    }
    const isUserExist = await this.checkService.isUserIdExist(userId);
    if (!isUserExist) {
      throw new CustomisableException('no access', 'user not found', 401);
    }

    const currentDevise = await this.usersDeviceService.getCurrentDevise(
      userId,
      deviceId,
    );
    if (!currentDevise) {
      throw new CustomisableException('no access', 'device not found', 401);
    }

    const lastActiveRefreshToken = new Date(payload.iat * 1000);
    
    if (lastActiveRefreshToken.toISOString() !== currentDevise.lastActiveDate.toISOString()) {
      throw new CustomisableException(
        'no access',
        'the last active dates do not match',
        401,
      );
    }
    return { userId, deviceId };
  }
}

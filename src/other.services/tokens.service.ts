import { Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from 'crypto';
import * as process from 'process';

@Injectable()
export class TokensService {
    constructor(private readonly jwtService: JwtService){}
    
  async createTokens(userId: string, deviceId: string) {
    const accessToken = await this.jwtService.signAsync(
      { userId: userId },
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    );
    
    const refreshTokenPayload = { userId, deviceId, salt: randomUUID() };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });
    return { accessToken, refreshToken };
  }

  getUserIdFromToken(token) {
    try {
      const result: any = this.jwtService.verify(token);
      return result.userId;
    } catch (error) {
      return null;
    }
  }

  getDeviceIdFromToken(token) {
    try {
      const result: any = this.jwtService.verify(token);
      return result.deviceId;
    } catch (error) {
      return null;
    }
  }

  async getLastActiveDateFromToken(refreshToken): Promise<string> {
    const payload: any = this.jwtService.decode(refreshToken);
    return new Date(payload.iat * 1000).toISOString();
  }

  async getExpirationDateFromRefreshToken(refreshToken): Promise<string> {
    const payload: any = this.jwtService.decode(refreshToken);
    return new Date(payload.exp * 1000).toISOString();
  }
}
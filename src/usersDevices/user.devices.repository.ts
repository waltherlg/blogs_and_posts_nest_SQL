import { Injectable, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class UsersDevicesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async addDeviceInfo(deviceInfoDTO): Promise<boolean> {
    const query = `INSERT INTO public."UserDevices"(
      "deviceId",
      "userId", 
      ip, 
      title, 
      "lastActiveDate", 
      "expirationDate")
      VALUES (
      $1, 
      $2, 
      $3, 
      $4, 
      $5, 
      $6)`;

    const result = await this.dataSource.query(query, [
      deviceInfoDTO.deviceId,
      deviceInfoDTO.userId, 
      deviceInfoDTO.ip, 
      deviceInfoDTO.title, 
      deviceInfoDTO.lastActiveDate, 
      deviceInfoDTO.expirationDate,
    ])
    return result.rowCount > 0
  }

  async getDeviceByUsersAndDeviceId(userId: string, deviceId: string) {
    if (!isValidUUID(userId) || !isValidUUID(deviceId)) {
      return null;
    }
    const query = `SELECT * FROM public."UserDevices"
    WHERE "userId" = $1 AND "deviceId" = $2
    LIMIT 1`;
    const result = await this.dataSource.query(query, [
      userId,
      deviceId,    
    ])
    return result[0]
  }
  async refreshDeviceInfo(
    deviceId,
    lastActiveDate,
    expirationDate,
  ): Promise<boolean> {
    if (!isValidUUID(deviceId)) {
      return false;
    }
    const query = `UPDATE public."UserDevices"
    SET "lastActiveDate" = $2, "expirationDate" = $3
    WHERE "deviceId" = $1 `
    
    const result = await this.dataSource.query(query, [
        deviceId,
        lastActiveDate,
        expirationDate
      ]);
    return (result[1] > 0)
    
  }

  async deleteDeviceByUserAndDeviceId(userId, deviceId): Promise<boolean> {
    if (!isValidUUID(userId) || !isValidUUID(deviceId)) {
      return false;
    }
    const query = `
    DELETE FROM public."UserDevices"
    WHERE "userId" = $1 AND "deviceId" = $2
    `
    const result = await this.dataSource.query(query, [userId, deviceId]);
    return result[1]
  }

  async deleteAllUserDevicesExceptCurrent(userId, deviceId): Promise<boolean> {
    if (!isValidUUID(userId) || !isValidUUID(deviceId)) {
      return false;
    }
    const query = `
    DELETE FROM public."UserDevices"
    WHERE "userId" = $1 AND "deviceId" <> $2;
    `
    const result = await this.dataSource.query(query, [userId, deviceId]);
    return (result[1] > 0)
  }

  async isUserDeviceExist(deviceId): Promise<boolean> {
    if (!isValidUUID(deviceId)) {
      return false;
    }
    const query = `
    SELECT COUNT(*) AS count
    FROM public."UserDevices"
    WHERE "deviceId" = $1
  `;
  const result = await this.dataSource.query(query, [deviceId]);
  const count = result[0].count;
  return count > 0;   
  }

  async deleteAllUserDevicesById(userId: string): Promise<boolean> {
    if (!isValidUUID(userId)) {
      return false;
    }
    const query = `   
    DELETE FROM public."UserDevices"
    WHERE "userId" = $1
    `
    const result = await this.dataSource.query(query, [userId]);
    return result.rowCount > 0; 
  }
}

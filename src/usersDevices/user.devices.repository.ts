import { Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersDevice, UsersDeviceDocument } from './users-devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersDevicesRepository {
  constructor(
    @InjectModel(UsersDevice.name)
    private usersDeviseModel: Model<UsersDeviceDocument>,
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
    const query = `
    DELETE FROM public."UserDevices"
    WHERE "userId" = $1 AND "deviceId" = $2
    `
    const result = await this.dataSource.query(query, [userId, deviceId]);
    return result[1]
  }

  async deleteAllUserDevicesExceptCurrent(userId, deviceId): Promise<boolean> {
    const query = `
    DELET from FROM public."UserDevices"
    WHERE "userId" = $1 AND "deviceId" <> $2;
    `
    const result = await this.dataSource.query(query, [userId, deviceId]);
    return (result[1] > 0)
  }

  async getUserDeviceById(deviceId) {
    if (!Types.ObjectId.isValid(deviceId)) {
      return null;
    }
    const userDevice = this.usersDeviseModel.findById(deviceId);
    if (!userDevice) {
      return null;
    }
    return userDevice;
  }
  async deleteAllUserDevicesById(userId: string): Promise<boolean> {
    const query = `   
    DELETE FROM public."UserDevices"
    WHERE "userId" = $1
    `
    const result = await this.dataSource.query(query, [userId]);
    return result.rowCount > 0; 
  }
}

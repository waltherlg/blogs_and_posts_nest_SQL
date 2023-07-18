import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersDevice, UsersDeviceDocument } from './users-devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class UserDevicesQueryRepository {
  constructor(
    @InjectModel(UsersDevice.name)
    private usersDeviseModel: Model<UsersDeviceDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getActiveUserDevices(userId: string) {
    if (!isValidUUID(userId)) {
      return null;
    }
    const query = `
    SELECT ip, title, "lastActiveDate", "deviceId"
    FROM public."UserDevices"
    WHERE "userId" = $1`
    const result = await this.dataSource.query(query, [
      userId
    ]);
    return result
  } 


}


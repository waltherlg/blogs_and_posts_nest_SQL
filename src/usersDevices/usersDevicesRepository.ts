import { Injectable } from '@nestjs/common';
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
      id,
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
      deviceInfoDTO.id,
      deviceInfoDTO.userId, 
      deviceInfoDTO.ip, 
      deviceInfoDTO.title, 
      deviceInfoDTO.lastActiveDate, 
      deviceInfoDTO.expirationDate,
    ])
    return result.rowCount > 0
  }
  async getDeviceByUsersAndDeviceId(userId: string, deviceId: string) {
    if (!(Types.ObjectId.isValid(userId) && Types.ObjectId.isValid(deviceId))) {
      return null;
    }
    const device = await this.usersDeviseModel.findOne({
      $and: [{ _id: deviceId }, { userId: userId }],
    });
    if (!device) {
      return null;
    }
    return device;
  }
  async refreshDeviceInfo(
    deviceId,
    lastActiveDate,
    expirationDate,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(deviceId)) {
      return false;
    }
    const userDevice = await this.usersDeviseModel.findById(deviceId);
    userDevice.lastActiveDate = lastActiveDate;
    userDevice.expirationDate = expirationDate;
    const result = userDevice.save();
    return !!result;
  }
  async getActiveUserDevices(userId: string) {
    console.log('userId ', userId);
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    const activeUserDevices = await this.usersDeviseModel.find({
      userId: userId,
    });
    console.log('activeUserDevices ', activeUserDevices);
    return activeUserDevices.map((device: UsersDeviceDocument) => {
      return device.prepareUsersDeviceForOutput();
    });
  }
  async deleteDeviceByUserAndDeviceId(userId, deviceId): Promise<boolean> {
    if (Types.ObjectId.isValid(deviceId)) {
      const result = await this.usersDeviseModel.deleteOne({
        $and: [{ _id: deviceId }, { userId: userId }],
      });
      return result.deletedCount === 1;
    } else return false;
  }
  async deleteAllUserDevicesExceptCurrent(user): Promise<boolean> {
    if (Types.ObjectId.isValid(user.deviceId)) {
      //let _id = new ObjectId(deviceId)
      const result = await this.usersDeviseModel.deleteMany({
        $and: [{ userId: user.userId }, { _id: { $ne: user.deviceId } }],
      });
      return result.acknowledged;
    } else return false;
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
  async deleteAllUserDevicesById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const result = await this.usersDeviseModel.deleteMany({userId: userId});
    return !!result
  }
}

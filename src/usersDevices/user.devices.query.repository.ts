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
  async 


}


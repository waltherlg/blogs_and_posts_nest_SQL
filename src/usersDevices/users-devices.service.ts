import { Injectable } from '@nestjs/common';
import { UsersDevicesRepository } from './user.devices.repository';

@Injectable()
export class UsersDeviceService {
  constructor(private readonly usersDeviceRepository: UsersDevicesRepository) {}

async getCurrentDeviceDataForRefreshStrategy(userId: string, deviceId: string){
  const currentDevice =
      await this.usersDeviceRepository.getDeviceByUsersAndDeviceId(
        userId,
        deviceId,
      );
    return currentDevice;
}

  async getCurrentDevise(userId: string, deviceId: string) {
    const currentDevice =
      await this.usersDeviceRepository.getDeviceByUsersAndDeviceId(
        userId,
        deviceId,
      );
    return currentDevice;
  }
  async getActiveUserDevices(userId: string) {
    const foundDevices = await this.usersDeviceRepository.getActiveUserDevices(
      userId,
    );
    return foundDevices;
  }

  async deleteDeviceByUserAndDeviceId(userId, deviceId) {
    const isUserDeviceDeleted =
      await this.usersDeviceRepository.deleteDeviceByUserAndDeviceId(
        userId,
        deviceId,
      );
    return isUserDeviceDeleted;
  }

  async deleteAllUserDevicesExceptCurrent(userId, deviceId) {
    const isDevicesDeleted =
      await this.usersDeviceRepository.deleteAllUserDevicesExceptCurrent(userId, deviceId);
    return isDevicesDeleted;
  }
}

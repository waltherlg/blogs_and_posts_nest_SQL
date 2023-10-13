export class UserDeviceDBType {
  constructor(
    public deviceId: string,
    public userId: string,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public expirationDate: string,
  ) {}
}

export type UserDeviceOutputType = {
  ip: string;
  title: string | unknown | null;
  lastActiveDate: string;
  deviceId: string;
};


import * as dotenv from 'dotenv';
dotenv.config();
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const userAndDataBase = process.env.ELEPHANT_USER_END_DATABASE
const password = process.env.ELEPHANT_PASSWORD

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'snuffleupagus.db.elephantsql.com',
  port: 5432,
  username: userAndDataBase,
  password: password,
  database: userAndDataBase,
  synchronize: false,
};

export default typeOrmConfig;
import * as dotenv from 'dotenv';
dotenv.config();
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const userName = process.env.PGUSER
const dataBaseName = process.env.PGDATABASE
const password = process.env.PGPASSWORD
const port = process.env.PGPORT
//const dataBaseUrl = process.env.SQL_URPGUSERL
const hostName = process.env.PGHOST

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'nest',
//   password: 'nest',
//   database: 'blogs_and_posts',
//   synchronize: false,
// };

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: hostName,
  port: +port,
  username: userName,
  password: password,
  database: dataBaseName,
  autoLoadEntities: false,
  //options: { encrypt: false },
  logging: false,
  synchronize: true,
  ssl: true,
  extra: {
      ssl: {
          rejectUnauthorized: false,
      },
  },
};

export default typeOrmConfig;
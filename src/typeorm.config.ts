import * as dotenv from 'dotenv';
dotenv.config();
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const userName = process.env.SQL_USER_NAME
const dataBaseName = process.env.SQL_DATABASE_NAME
const password = process.env.SQL_PASSWORD
const dataBaseUrl = process.env.SQL_URL

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'snuffleupagus.db.elephantsql.com',
//   port: 5432,
//   username: userAndDataBase,
//   password: password,
//   database: userAndDataBase,
//   synchronize: false,
// };

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: dataBaseUrl,
  synchronize: false,
};

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'nest',
//   password: 'nest',
//   database: 'blogs_and_posts',
//   synchronize: false,
// };

export default typeOrmConfig;
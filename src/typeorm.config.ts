import * as dotenv from 'dotenv';
dotenv.config();
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const userName = process.env.SQL_USER_NAME
const dataBaseName = process.env.SQL_DATABASE_NAME
const password = process.env.SQL_PASSWORD
const dataBaseUrl = process.env.SQL_URL
const hostName = process.env.SQL_HOST_NAME

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'snuffleupagus.db.elephantsql.com',
//   port: 5432,
//   username: userAndDataBase,
//   password: password,
//   database: userAndDataBase,
//   synchronize: false,
// };

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: hostName,
//   port: 5432,
//   username: userName,
//   password: password,
//   database: dataBaseName,
//   synchronize: false,
// };

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'frankfurt-postgres.render.com',
//   port: 5432,
//   username: 'render_blogs_and_posts_hw_user',
//   password: 'wHPRvmS7K1FQ9hFSQUHGRCdShGrRcM6A',
//   database: 'render_blogs_and_posts_hw',
//   synchronize: false,
// };


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
  host: process.env.PGHOST,
  port: +process.env.PGPORT, // Если ваша база данных находится на другом порту, укажите соответствующий порт
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  synchronize: false,
};

export default typeOrmConfig;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';
import cookieParser from 'cookie-parser';
//import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { addAppSettings } from './helpers/helpers';

async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = addAppSettings(rawApp)
  await app.listen(3000);
}
bootstrap();

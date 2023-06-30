import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { addAppSettings } from './helpers/helpers';

async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = addAppSettings(rawApp)
  await app.listen(3000);
}
bootstrap();

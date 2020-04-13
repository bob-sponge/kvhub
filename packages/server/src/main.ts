import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(session({ secret: 'you know who', cookie: { maxAge: 3600000 } }));
  await app.listen(5000);
}
bootstrap();

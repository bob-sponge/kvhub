import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './interceptor/logger.inteceptor';
import { BadRequestExceptionFilter } from './interceptor/request.exception.filter';
import { SessionCheckInterceptor } from './interceptor/sessioncheck.inteceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalInterceptors(new SessionCheckInterceptor());
  app.use(session({ secret: 'you know who', cookie: { maxAge: 3600000 }, rolling: true }, new ValidationPipe()));
  app.use(cookieParser());
  app.useGlobalFilters(new BadRequestExceptionFilter());
  await app.listen(5000);
}
bootstrap();

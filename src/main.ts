import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from "@nestjs/common";
import { APP_PORT } from "./common/configs/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      const firstError = errors[0].constraints;
      return new HttpException(firstError[Object.keys(firstError)[0]], HttpStatus.BAD_REQUEST);
    }
  }));
  await app.listen(APP_PORT);
}
bootstrap().then(() => {
  console.log('Listening on port', APP_PORT);
});

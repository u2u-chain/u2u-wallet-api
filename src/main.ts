import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from "@nestjs/common";

const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      const firstError = errors[0].constraints;
      return new HttpException(firstError[Object.keys(firstError)[0]], HttpStatus.BAD_REQUEST);
    }
  }));
  await app.listen(port);
}
bootstrap().then(() => {
  console.log('Listening on port', port);
});

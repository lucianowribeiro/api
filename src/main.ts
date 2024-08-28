import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { InvalidDataException } from './config/exceptions/invalid_data.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new InvalidDataException(validationErrors);
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { InvalidDataException } from './config/exceptions/invalid-data.exception';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new InvalidDataException(validationErrors);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Measure')
    .setDescription(
      'Api criado durante um teste tecnico de back-end para vaga de desenvolvedor fullstack',
    )
    .setVersion('1.0')
    .addTag('measure')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(3000);
}
bootstrap();

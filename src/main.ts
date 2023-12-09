import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { formatErrorsHelper } from './utils/error/format-error.util';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HttpExceptionFilter } from './filters/bad-request.filter';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      always: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      enableDebugMessages: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException(formatErrorsHelper(errors));
      },
    }),
  );
  app.setGlobalPrefix('api');

  // Filter
  const reflector = app.get(Reflector);
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(reflector),
  );

  //Swagger document configuration
  const config = new DocumentBuilder()
    .setTitle('Easy Generator')
    .setDescription('Easy Generator Authentication Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/api-docs', app, document);

  await app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(3000, '0.0.0.0');

  // Hot module replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

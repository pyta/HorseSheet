import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getAppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = getAppConfig();

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HorseSheet API')
    .setDescription('HorseSheet Stable Management System API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token (architecture ready, not enforced in MVP)',
      },
      'Bearer',
    )
    .addTag('stables', 'Stable management')
    .addTag('instructors', 'Instructor management')
    .addTag('activities', 'Activity management')
    .addTag('services', 'Service management')
    .addTag('participants', 'Participant management')
    .addTag('contact-persons', 'Contact person management')
    .addTag('service-price-lists', 'Service price list management')
    .addTag('activity-price-lists', 'Activity price list management')
    .addTag('activity-schedule-entries', 'Activity schedule entry management')
    .addTag('service-schedule-entries', 'Service schedule entry management')
    .addTag('individual-service-price-lists', 'Individual service price list management')
    .addTag('individual-activity-price-lists', 'Individual activity price list management')
    .addTag('payments', 'Payment management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(config.port);
  console.log(`Application is running on: http://localhost:${config.port}`);
  console.log(`Swagger documentation: http://localhost:${config.port}/api/docs`);
}

bootstrap();

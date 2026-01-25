import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getAppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = getAppConfig();

  // Trust proxy - CRITICAL for cookies behind reverse proxy
  // This allows Express to trust X-Forwarded-* headers from nginx
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().set('trust proxy', true);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS - handle comma-separated origins or single origin
  // Must be configured BEFORE helmet to avoid conflicts
  // Note: '*' is not allowed when credentials: true, so we validate this
  if (config.corsOrigin === '*') {
    console.warn('⚠️  CORS_ORIGIN is set to "*" but credentials are enabled. This will cause CORS errors.');
    console.warn('   Defaulting to http://localhost:5173 for development.');
    config.corsOrigin = 'http://localhost:5173';
  }

  const corsOrigins = config.corsOrigin.includes(',')
    ? config.corsOrigin.split(',').map((origin) => origin.trim())
    : config.corsOrigin;

  console.log(`CORS configured for origin(s): ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : corsOrigins}`);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  });

  // Security middleware (after CORS)
  app.use(helmet.default({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cookieParser());

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
    .addTag('auth', 'Authentication')
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

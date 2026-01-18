import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isDevelopment = configService.get<string>('NODE_ENV') === 'development';
  
  return {
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false, // Set to true if you want migrations to run automatically on app start
    // Note: synchronize should be false in production. In development, you can use either
    // synchronize or migrations, but not both. Set synchronize to false when using migrations.
    synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
    logging: isDevelopment,
    ssl: configService.get<string>('DATABASE_SSL') === 'true' ? {
      rejectUnauthorized: false,
    } : false,
  };
};

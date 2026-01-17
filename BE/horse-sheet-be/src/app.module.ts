import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { StableModule } from './stable/stable.module';
import { InstructorModule } from './instructor/instructor.module';
import { ActivityModule } from './activity/activity.module';
import { ServiceModule } from './service/service.module';
import { ParticipantModule } from './participant/participant.module';
import { ContactPersonModule } from './contact-person/contact-person.module';
import { PriceListModule } from './price-list/price-list.module';
import { ScheduleEntryModule } from './schedule-entry/schedule-entry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    StableModule,
    InstructorModule,
    ActivityModule,
    ServiceModule,
    ParticipantModule,
    ContactPersonModule,
    PriceListModule,
    ScheduleEntryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware globally (architecture ready, not enforced in MVP)
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}

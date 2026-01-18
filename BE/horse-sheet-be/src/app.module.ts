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
import { ServicePriceListModule } from './service-price-list/service-price-list.module';
import { ActivityPriceListModule } from './activity-price-list/activity-price-list.module';
import { ActivityScheduleEntryModule } from './activity-schedule-entry/activity-schedule-entry.module';
import { ServiceScheduleEntryModule } from './service-schedule-entry/service-schedule-entry.module';
import { IndividualServicePriceListModule } from './individual-service-price-list/individual-service-price-list.module';
import { IndividualActivityPriceListModule } from './individual-activity-price-list/individual-activity-price-list.module';
import { PaymentModule } from './payment/payment.module';

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
    ServicePriceListModule,
    ActivityPriceListModule,
    ActivityScheduleEntryModule,
    ServiceScheduleEntryModule,
    IndividualServicePriceListModule,
    IndividualActivityPriceListModule,
    PaymentModule,
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

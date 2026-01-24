import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { BalanceCalculationService } from './balance-calculation.service';
import { Balance } from './entities/balance.entity';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';
import { ActivityPriceList } from '../activity-price-list/entities/activity-price-list.entity';
import { IndividualActivityPriceList } from '../individual-activity-price-list/entities/individual-activity-price-list.entity';
import { ActivityPriceListHistory } from '../activity-price-list-history/entities/activity-price-list-history.entity';
import { IndividualActivityPriceListHistory } from '../individual-activity-price-list-history/entities/individual-activity-price-list-history.entity';
import { ServicePriceList } from '../service-price-list/entities/service-price-list.entity';
import { IndividualServicePriceList } from '../individual-service-price-list/entities/individual-service-price-list.entity';
import { ServicePriceListHistory } from '../service-price-list-history/entities/service-price-list-history.entity';
import { IndividualServicePriceListHistory } from '../individual-service-price-list-history/entities/individual-service-price-list-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Balance,
      ContactPerson,
      ActivityPriceList,
      IndividualActivityPriceList,
      ActivityPriceListHistory,
      IndividualActivityPriceListHistory,
      ServicePriceList,
      IndividualServicePriceList,
      ServicePriceListHistory,
      IndividualServicePriceListHistory,
    ]),
  ],
  controllers: [BalanceController],
  providers: [BalanceService, BalanceCalculationService],
  exports: [BalanceService, BalanceCalculationService],
})
export class BalanceModule {}


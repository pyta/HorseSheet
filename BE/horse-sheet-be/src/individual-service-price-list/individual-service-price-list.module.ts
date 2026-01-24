import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualServicePriceListService } from './individual-service-price-list.service';
import { IndividualServicePriceListController } from './individual-service-price-list.controller';
import { IndividualServicePriceList } from './entities/individual-service-price-list.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Service } from '../service/entities/service.entity';
import { Participant } from '../participant/entities/participant.entity';
import { IndividualServicePriceListHistory } from '../individual-service-price-list-history/entities/individual-service-price-list-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndividualServicePriceList, Stable, Service, Participant, IndividualServicePriceListHistory])],
  controllers: [IndividualServicePriceListController],
  providers: [IndividualServicePriceListService],
  exports: [IndividualServicePriceListService],
})
export class IndividualServicePriceListModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePriceListService } from './service-price-list.service';
import { ServicePriceListController } from './service-price-list.controller';
import { ServicePriceList } from './entities/service-price-list.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Service } from '../service/entities/service.entity';
import { ServicePriceListHistory } from '../service-price-list-history/entities/service-price-list-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicePriceList, Stable, Service, ServicePriceListHistory])],
  controllers: [ServicePriceListController],
  providers: [ServicePriceListService],
  exports: [ServicePriceListService],
})
export class ServicePriceListModule {}

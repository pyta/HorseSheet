import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityPriceListService } from './activity-price-list.service';
import { ActivityPriceListController } from './activity-price-list.controller';
import { ActivityPriceList } from './entities/activity-price-list.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Activity } from '../activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityPriceList, Stable, Activity])],
  controllers: [ActivityPriceListController],
  providers: [ActivityPriceListService],
  exports: [ActivityPriceListService],
})
export class ActivityPriceListModule {}

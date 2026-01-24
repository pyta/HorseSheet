import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualActivityPriceListService } from './individual-activity-price-list.service';
import { IndividualActivityPriceListController } from './individual-activity-price-list.controller';
import { IndividualActivityPriceList } from './entities/individual-activity-price-list.entity';
import { Stable } from '../stable/entities/stable.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { Participant } from '../participant/entities/participant.entity';
import { IndividualActivityPriceListHistory } from '../individual-activity-price-list-history/entities/individual-activity-price-list-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndividualActivityPriceList,
      Stable,
      Activity,
      Instructor,
      Participant,
      IndividualActivityPriceListHistory,
    ]),
  ],
  controllers: [IndividualActivityPriceListController],
  providers: [IndividualActivityPriceListService],
  exports: [IndividualActivityPriceListService],
})
export class IndividualActivityPriceListModule {}

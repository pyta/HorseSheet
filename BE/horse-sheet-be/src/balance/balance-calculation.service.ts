import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ActivityScheduleEntry } from '../activity-schedule-entry/entities/activity-schedule-entry.entity';
import { ServiceScheduleEntry } from '../service-schedule-entry/entities/service-schedule-entry.entity';
import { ActivityPriceList } from '../activity-price-list/entities/activity-price-list.entity';
import { IndividualActivityPriceList } from '../individual-activity-price-list/entities/individual-activity-price-list.entity';
import { ActivityPriceListHistory } from '../activity-price-list-history/entities/activity-price-list-history.entity';
import { IndividualActivityPriceListHistory } from '../individual-activity-price-list-history/entities/individual-activity-price-list-history.entity';
import { ServicePriceList } from '../service-price-list/entities/service-price-list.entity';
import { IndividualServicePriceList } from '../individual-service-price-list/entities/individual-service-price-list.entity';
import { ServicePriceListHistory } from '../service-price-list-history/entities/service-price-list-history.entity';
import { IndividualServicePriceListHistory } from '../individual-service-price-list-history/entities/individual-service-price-list-history.entity';

@Injectable()
export class BalanceCalculationService {
  constructor(
    @InjectRepository(ActivityPriceList)
    private readonly activityPriceListRepository: Repository<ActivityPriceList>,
    @InjectRepository(IndividualActivityPriceList)
    private readonly individualActivityPriceListRepository: Repository<IndividualActivityPriceList>,
    @InjectRepository(ActivityPriceListHistory)
    private readonly activityPriceListHistoryRepository: Repository<ActivityPriceListHistory>,
    @InjectRepository(IndividualActivityPriceListHistory)
    private readonly individualActivityPriceListHistoryRepository: Repository<IndividualActivityPriceListHistory>,
    @InjectRepository(ServicePriceList)
    private readonly servicePriceListRepository: Repository<ServicePriceList>,
    @InjectRepository(IndividualServicePriceList)
    private readonly individualServicePriceListRepository: Repository<IndividualServicePriceList>,
    @InjectRepository(ServicePriceListHistory)
    private readonly servicePriceListHistoryRepository: Repository<ServicePriceListHistory>,
    @InjectRepository(IndividualServicePriceListHistory)
    private readonly individualServicePriceListHistoryRepository: Repository<IndividualServicePriceListHistory>,
  ) {}

  async calculateActivityPrice(
    activityScheduleEntry: ActivityScheduleEntry,
    participantId: string,
  ): Promise<number> {
    const activityDate = new Date(activityScheduleEntry.date);
    const isPast = activityDate < new Date();

    // Try to get individual price first
    const individualPrice = await this.individualActivityPriceListRepository.findOne({
      where: {
        stableId: activityScheduleEntry.stableId,
        activityId: activityScheduleEntry.activityId,
        instructorId: activityScheduleEntry.instructorId,
        participantId: participantId,
        deletedAt: IsNull(),
      },
    });

    let price: number | null = null;

    if (individualPrice) {
      if (isPast) {
        // Find history entry that covers the activity date
        const historyEntries = await this.individualActivityPriceListHistoryRepository.find({
          where: {
            stableId: activityScheduleEntry.stableId,
            activityId: activityScheduleEntry.activityId,
            instructorId: activityScheduleEntry.instructorId,
            participantId: participantId,
            deletedAt: IsNull(),
          },
          order: { dateFrom: 'DESC' },
        });

        for (const entry of historyEntries) {
          const dateFrom = new Date(entry.dateFrom);
          const dateTo = entry.dateTo ? new Date(entry.dateTo) : new Date();
          if (activityDate >= dateFrom && activityDate <= dateTo) {
            price = Number(entry.price);
            break;
          }
        }

        if (price === null) {
          price = Number(individualPrice.price);
        }
      } else {
        price = Number(individualPrice.price);
      }
    } else {
      // Get standard price
      const standardPrice = await this.activityPriceListRepository.findOne({
        where: {
          stableId: activityScheduleEntry.stableId,
          activityId: activityScheduleEntry.activityId,
          isActive: true,
          deletedAt: IsNull(),
        },
      });

      if (standardPrice) {
        if (isPast) {
          // Get from history
          const historyEntries = await this.activityPriceListHistoryRepository.find({
            where: {
              stableId: activityScheduleEntry.stableId,
              activityId: activityScheduleEntry.activityId,
              deletedAt: IsNull(),
            },
            order: { dateFrom: 'DESC' },
          });

          for (const entry of historyEntries) {
            const dateFrom = new Date(entry.dateFrom);
            const dateTo = entry.dateTo ? new Date(entry.dateTo) : new Date();
            if (activityDate >= dateFrom && activityDate <= dateTo) {
              price = Number(entry.price);
              break;
            }
          }

          if (price === null) {
            price = Number(standardPrice.price);
          }
        } else {
          price = Number(standardPrice.price);
        }
      }
    }

    if (price === null) {
      return 0;
    }

    // Calculate total: price * (duration / 60)
    return price * (activityScheduleEntry.duration / 60);
  }

  async calculateServicePrice(
    serviceScheduleEntry: ServiceScheduleEntry,
    participantId: string,
  ): Promise<number> {
    const serviceDate = new Date(serviceScheduleEntry.date);
    const isPast = serviceDate < new Date();

    // Try to get individual price first
    const individualPrice = await this.individualServicePriceListRepository.findOne({
      where: {
        stableId: serviceScheduleEntry.stableId,
        serviceId: serviceScheduleEntry.serviceId,
        participantId: participantId,
        deletedAt: IsNull(),
      },
    });

    let price: number | null = null;

    if (individualPrice) {
      if (isPast) {
        // Get from history
        const historyEntries = await this.individualServicePriceListHistoryRepository.find({
          where: {
            stableId: serviceScheduleEntry.stableId,
            serviceId: serviceScheduleEntry.serviceId,
            participantId: participantId,
            deletedAt: IsNull(),
          },
          order: { dateFrom: 'DESC' },
        });

        for (const entry of historyEntries) {
          const dateFrom = new Date(entry.dateFrom);
          const dateTo = entry.dateTo ? new Date(entry.dateTo) : new Date();
          if (serviceDate >= dateFrom && serviceDate <= dateTo) {
            price = Number(entry.price);
            break;
          }
        }

        if (price === null) {
          price = Number(individualPrice.price);
        }
      } else {
        price = Number(individualPrice.price);
      }
    } else {
      // Get standard price
      const standardPrice = await this.servicePriceListRepository.findOne({
        where: {
          stableId: serviceScheduleEntry.stableId,
          serviceId: serviceScheduleEntry.serviceId,
          isActive: true,
          deletedAt: IsNull(),
        },
      });

      if (standardPrice) {
        if (isPast) {
          // Get from history
          const historyEntries = await this.servicePriceListHistoryRepository.find({
            where: {
              stableId: serviceScheduleEntry.stableId,
              serviceId: serviceScheduleEntry.serviceId,
              deletedAt: IsNull(),
            },
            order: { dateFrom: 'DESC' },
          });

          for (const entry of historyEntries) {
            const dateFrom = new Date(entry.dateFrom);
            const dateTo = entry.dateTo ? new Date(entry.dateTo) : new Date();
            if (serviceDate >= dateFrom && serviceDate <= dateTo) {
              price = Number(entry.price);
              break;
            }
          }

          if (price === null) {
            price = Number(standardPrice.price);
          }
        } else {
          price = Number(standardPrice.price);
        }
      }
    }

    if (price === null) {
      return 0;
    }

    // For services, duration is a string (day/month/etc), so we just return the price
    // The duration calculation can be enhanced later based on business requirements
    return price;
  }
}


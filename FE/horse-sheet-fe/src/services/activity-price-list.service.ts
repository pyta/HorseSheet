import api from './api';
import type { ActivityPriceList, CreateActivityPriceListDto, UpdateActivityPriceListDto } from '@/types';
import type { ApiResponse } from './types';

export const activityPriceListService = {
  async findAll(): Promise<ActivityPriceList[]> {
    const response = await api.get<ApiResponse<ActivityPriceList[]>>('/activity-price-lists');
    return response.data.data;
  },

  async findOne(id: string): Promise<ActivityPriceList> {
    const response = await api.get<ApiResponse<ActivityPriceList>>(`/activity-price-lists/${id}`);
    return response.data.data;
  },

  async create(data: CreateActivityPriceListDto): Promise<ActivityPriceList> {
    const response = await api.post<ApiResponse<ActivityPriceList>>('/activity-price-lists', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateActivityPriceListDto): Promise<ActivityPriceList> {
    const response = await api.patch<ApiResponse<ActivityPriceList>>(`/activity-price-lists/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/activity-price-lists/${id}`);
  },
};

import api from './api';
import type {
  IndividualActivityPriceList,
  CreateIndividualActivityPriceListDto,
  UpdateIndividualActivityPriceListDto,
} from '@/types';
import type { ApiResponse } from './types';

export const individualActivityPriceListService = {
  async findAll(): Promise<IndividualActivityPriceList[]> {
    const response = await api.get<ApiResponse<IndividualActivityPriceList[]>>('/individual-activity-price-lists');
    return response.data.data;
  },

  async findOne(id: string): Promise<IndividualActivityPriceList> {
    const response = await api.get<ApiResponse<IndividualActivityPriceList>>(`/individual-activity-price-lists/${id}`);
    return response.data.data;
  },

  async create(data: CreateIndividualActivityPriceListDto): Promise<IndividualActivityPriceList> {
    const response = await api.post<ApiResponse<IndividualActivityPriceList>>('/individual-activity-price-lists', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateIndividualActivityPriceListDto): Promise<IndividualActivityPriceList> {
    const response = await api.patch<ApiResponse<IndividualActivityPriceList>>(`/individual-activity-price-lists/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/individual-activity-price-lists/${id}`);
  },
};

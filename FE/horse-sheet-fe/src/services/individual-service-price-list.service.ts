import api from './api';
import type {
  IndividualServicePriceList,
  CreateIndividualServicePriceListDto,
  UpdateIndividualServicePriceListDto,
} from '@/types';
import type { ApiResponse } from './types';

export const individualServicePriceListService = {
  async findAll(): Promise<IndividualServicePriceList[]> {
    const response = await api.get<ApiResponse<IndividualServicePriceList[]>>('/individual-service-price-lists');
    return response.data.data;
  },

  async findOne(id: string): Promise<IndividualServicePriceList> {
    const response = await api.get<ApiResponse<IndividualServicePriceList>>(`/individual-service-price-lists/${id}`);
    return response.data.data;
  },

  async create(data: CreateIndividualServicePriceListDto): Promise<IndividualServicePriceList> {
    const response = await api.post<ApiResponse<IndividualServicePriceList>>('/individual-service-price-lists', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateIndividualServicePriceListDto): Promise<IndividualServicePriceList> {
    const response = await api.patch<ApiResponse<IndividualServicePriceList>>(`/individual-service-price-lists/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/individual-service-price-lists/${id}`);
  },
};

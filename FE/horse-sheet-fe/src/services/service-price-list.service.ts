import api from './api';
import type { ServicePriceList, CreateServicePriceListDto, UpdateServicePriceListDto } from '@/types';
import type { ApiResponse } from './types';

export const servicePriceListService = {
  async findAll(): Promise<ServicePriceList[]> {
    const response = await api.get<ApiResponse<ServicePriceList[]>>('/service-price-lists');
    return response.data.data;
  },

  async findOne(id: string): Promise<ServicePriceList> {
    const response = await api.get<ApiResponse<ServicePriceList>>(`/service-price-lists/${id}`);
    return response.data.data;
  },

  async create(data: CreateServicePriceListDto): Promise<ServicePriceList> {
    const response = await api.post<ApiResponse<ServicePriceList>>('/service-price-lists', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateServicePriceListDto): Promise<ServicePriceList> {
    const response = await api.patch<ApiResponse<ServicePriceList>>(`/service-price-lists/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/service-price-lists/${id}`);
  },
};

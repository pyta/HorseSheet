import api from './api';
import type { Service, CreateServiceDto, UpdateServiceDto } from '@/types';
import type { ApiResponse } from './types';

export const serviceService = {
  async findAll(): Promise<Service[]> {
    const response = await api.get<ApiResponse<Service[]>>('/services');
    return response.data.data;
  },

  async findOne(id: string): Promise<Service> {
    const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data.data;
  },

  async create(data: CreateServiceDto): Promise<Service> {
    const response = await api.post<ApiResponse<Service>>('/services', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateServiceDto): Promise<Service> {
    const response = await api.patch<ApiResponse<Service>>(`/services/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};

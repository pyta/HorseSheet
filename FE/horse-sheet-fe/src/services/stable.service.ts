import api from './api';
import type { Stable, CreateStableDto, UpdateStableDto } from '@/types';
import type { ApiResponse } from './types';

export const stableService = {
  async findAll(): Promise<Stable[]> {
    const response = await api.get<ApiResponse<Stable[]>>('/stables');
    return response.data.data;
  },

  async findOne(id: string): Promise<Stable> {
    const response = await api.get<ApiResponse<Stable>>(`/stables/${id}`);
    return response.data.data;
  },

  async create(data: CreateStableDto): Promise<Stable> {
    const response = await api.post<ApiResponse<Stable>>('/stables', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateStableDto): Promise<Stable> {
    const response = await api.patch<ApiResponse<Stable>>(`/stables/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/stables/${id}`);
  },
};

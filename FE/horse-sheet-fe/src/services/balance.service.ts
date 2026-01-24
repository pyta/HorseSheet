import api from './api';
import type { Balance, CreateBalanceDto, UpdateBalanceDto } from '@/types';
import type { ApiResponse } from './types';

export const balanceService = {
  async findAll(): Promise<Balance[]> {
    const response = await api.get<ApiResponse<Balance[]>>('/balances');
    return response.data.data;
  },

  async findOne(id: string): Promise<Balance> {
    const response = await api.get<ApiResponse<Balance>>(`/balances/${id}`);
    return response.data.data;
  },

  async findByContactPersonId(contactPersonId: string): Promise<Balance | null> {
    try {
      const response = await api.get<ApiResponse<Balance>>(`/balances/contact-person/${contactPersonId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async create(data: CreateBalanceDto): Promise<Balance> {
    const response = await api.post<ApiResponse<Balance>>('/balances', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateBalanceDto): Promise<Balance> {
    const response = await api.patch<ApiResponse<Balance>>(`/balances/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/balances/${id}`);
  },
};


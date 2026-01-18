import api from './api';
import type { Payment, CreatePaymentDto, UpdatePaymentDto } from '@/types';
import type { ApiResponse } from './types';

export const paymentService = {
  async findAll(): Promise<Payment[]> {
    const response = await api.get<ApiResponse<Payment[]>>('/payments');
    return response.data.data;
  },

  async findOne(id: string): Promise<Payment> {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await api.post<ApiResponse<Payment>>('/payments', data);
    return response.data.data;
  },

  async update(id: string, data: UpdatePaymentDto): Promise<Payment> {
    const response = await api.patch<ApiResponse<Payment>>(`/payments/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  },
};

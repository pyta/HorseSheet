import api from './api';
import type { Role } from '@/types';
import type { ApiResponse } from './types';

export const roleService = {
  async findAll(): Promise<Role[]> {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data.data;
  },

  async findOne(id: string): Promise<Role> {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },
};


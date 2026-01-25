import api from './api';
import type { User, CreateUserDto, UpdateUserDto } from '@/types';
import type { ApiResponse } from './types';

export const userService = {
  async findAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  async findOne(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};


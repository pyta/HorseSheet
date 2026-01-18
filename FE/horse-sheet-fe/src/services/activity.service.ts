import api from './api';
import type { Activity, CreateActivityDto, UpdateActivityDto } from '@/types';
import type { ApiResponse } from './types';

export const activityService = {
  async findAll(): Promise<Activity[]> {
    const response = await api.get<ApiResponse<Activity[]>>('/activities');
    return response.data.data;
  },

  async findOne(id: string): Promise<Activity> {
    const response = await api.get<ApiResponse<Activity>>(`/activities/${id}`);
    return response.data.data;
  },

  async create(data: CreateActivityDto): Promise<Activity> {
    const response = await api.post<ApiResponse<Activity>>('/activities', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateActivityDto): Promise<Activity> {
    const response = await api.patch<ApiResponse<Activity>>(`/activities/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  },
};

import api from './api';
import type { Instructor, CreateInstructorDto, UpdateInstructorDto } from '@/types';
import type { ApiResponse } from './types';

export const instructorService = {
  async findAll(): Promise<Instructor[]> {
    const response = await api.get<ApiResponse<Instructor[]>>('/instructors');
    return response.data.data;
  },

  async findOne(id: string): Promise<Instructor> {
    const response = await api.get<ApiResponse<Instructor>>(`/instructors/${id}`);
    return response.data.data;
  },

  async create(data: CreateInstructorDto): Promise<Instructor> {
    const response = await api.post<ApiResponse<Instructor>>('/instructors', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateInstructorDto): Promise<Instructor> {
    const response = await api.patch<ApiResponse<Instructor>>(`/instructors/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/instructors/${id}`);
  },
};

import api from './api';
import type { Participant, CreateParticipantDto, UpdateParticipantDto } from '@/types';
import type { ApiResponse } from './types';

export const participantService = {
  async findAll(): Promise<Participant[]> {
    const response = await api.get<ApiResponse<Participant[]>>('/participants');
    return response.data.data;
  },

  async findOne(id: string): Promise<Participant> {
    const response = await api.get<ApiResponse<Participant>>(`/participants/${id}`);
    return response.data.data;
  },

  async create(data: CreateParticipantDto): Promise<Participant> {
    const response = await api.post<ApiResponse<Participant>>('/participants', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateParticipantDto): Promise<Participant> {
    const response = await api.patch<ApiResponse<Participant>>(`/participants/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/participants/${id}`);
  },
};

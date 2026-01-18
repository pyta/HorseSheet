import api from './api';
import type { ContactPerson, CreateContactPersonDto, UpdateContactPersonDto } from '@/types';
import type { ApiResponse } from './types';

export const contactPersonService = {
  async findAll(): Promise<ContactPerson[]> {
    const response = await api.get<ApiResponse<ContactPerson[]>>('/contact-persons');
    return response.data.data;
  },

  async findOne(id: string): Promise<ContactPerson> {
    const response = await api.get<ApiResponse<ContactPerson>>(`/contact-persons/${id}`);
    return response.data.data;
  },

  async create(data: CreateContactPersonDto): Promise<ContactPerson> {
    const response = await api.post<ApiResponse<ContactPerson>>('/contact-persons', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateContactPersonDto): Promise<ContactPerson> {
    const response = await api.patch<ApiResponse<ContactPerson>>(`/contact-persons/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contact-persons/${id}`);
  },
};

import api from './api';
import type {
  ServiceScheduleEntry,
  CreateServiceScheduleEntryDto,
  UpdateServiceScheduleEntryDto,
} from '@/types';
import type { ApiResponse } from './types';

// Backend response type (with serviceScheduleEntryDetails)
interface ServiceScheduleEntryResponse {
  id: string;
  stableId: string;
  date: string | Date;
  duration: string;
  serviceId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
  serviceScheduleEntryDetails?: Array<{
    id: string;
    participantId: string;
    [key: string]: any;
  }>;
}

function transformEntry(entry: ServiceScheduleEntryResponse): ServiceScheduleEntry {
  let dateString: string;
  if (typeof entry.date === 'string') {
    dateString = entry.date;
  } else if (entry.date instanceof Date) {
    const isoString = entry.date.toISOString();
    dateString = isoString.split('T')[0] ?? '';
  } else {
    dateString = '';
  }

  return {
    ...entry,
    date: dateString,
    participantIds: entry.serviceScheduleEntryDetails?.map((detail) => detail.participantId) || [],
  };
}

export const serviceScheduleEntryService = {
  async findAll(): Promise<ServiceScheduleEntry[]> {
    const response = await api.get<ApiResponse<ServiceScheduleEntryResponse[]>>('/service-schedule-entries');
    const entries = response.data.data;
    return Array.isArray(entries) ? entries.map(transformEntry) : [];
  },

  async findOne(id: string): Promise<ServiceScheduleEntry> {
    const response = await api.get<ApiResponse<ServiceScheduleEntryResponse>>(`/service-schedule-entries/${id}`);
    return transformEntry(response.data.data);
  },

  async create(data: CreateServiceScheduleEntryDto): Promise<ServiceScheduleEntry> {
    const response = await api.post<ApiResponse<ServiceScheduleEntry>>('/service-schedule-entries', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateServiceScheduleEntryDto): Promise<ServiceScheduleEntry> {
    const response = await api.patch<ApiResponse<ServiceScheduleEntry>>(`/service-schedule-entries/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/service-schedule-entries/${id}`);
  },
};

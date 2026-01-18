import api from './api';
import type {
  ActivityScheduleEntry,
  CreateActivityScheduleEntryDto,
  UpdateActivityScheduleEntryDto,
} from '@/types';
import type { ApiResponse } from './types';

// Backend response type (with activityScheduleEntryDetails)
interface ActivityScheduleEntryResponse {
  id: string;
  stableId: string;
  date: string | Date;
  time: string;
  duration: number;
  instructorId: string;
  activityId: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
  activityScheduleEntryDetails?: Array<{
    id: string;
    participantId: string;
    [key: string]: any;
  }>;
}

function transformEntry(entry: ActivityScheduleEntryResponse): ActivityScheduleEntry {
  return {
    ...entry,
    date: typeof entry.date === 'string' ? entry.date : entry.date.toISOString().split('T')[0],
    participantIds: entry.activityScheduleEntryDetails?.map((detail) => detail.participantId) || [],
  };
}

export const activityScheduleEntryService = {
  async findAll(): Promise<ActivityScheduleEntry[]> {
    const response = await api.get<ApiResponse<ActivityScheduleEntryResponse[]>>('/activity-schedule-entries');
    const entries = response.data.data;
    return Array.isArray(entries) ? entries.map(transformEntry) : [];
  },

  async findOne(id: string): Promise<ActivityScheduleEntry> {
    const response = await api.get<ApiResponse<ActivityScheduleEntryResponse>>(`/activity-schedule-entries/${id}`);
    return transformEntry(response.data.data);
  },

  async create(data: CreateActivityScheduleEntryDto): Promise<ActivityScheduleEntry> {
    const response = await api.post<ApiResponse<ActivityScheduleEntry>>('/activity-schedule-entries', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateActivityScheduleEntryDto): Promise<ActivityScheduleEntry> {
    const response = await api.patch<ApiResponse<ActivityScheduleEntry>>(`/activity-schedule-entries/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/activity-schedule-entries/${id}`);
  },
};

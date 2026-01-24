// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
}

// Stable
export interface Stable extends BaseEntity {
  name: string;
  address?: string;
  contactInfo?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface CreateStableDto {
  name: string;
  address?: string;
  contactInfo?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface UpdateStableDto extends Partial<CreateStableDto> {
  version?: number;
}

// Service
export interface Service extends BaseEntity {
  name: string;
  description?: string;
  stableId: string;
  isActive?: boolean;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  stableId: string;
  isActive?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  version?: number;
}

// Contact Person
export interface ContactPerson extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  stableId: string;
  isActive?: boolean;
}

export interface CreateContactPersonDto {
  name: string;
  email?: string;
  phone?: string;
  stableId: string;
  isActive?: boolean;
}

export interface UpdateContactPersonDto extends Partial<CreateContactPersonDto> {
  version?: number;
}

// Participant
export interface Participant extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  stableId: string;
  defaultContactPersonId: string;
  isActive?: boolean;
}

export interface CreateParticipantDto {
  name: string;
  email?: string;
  phone?: string;
  stableId: string;
  defaultContactPersonId: string;
  isActive?: boolean;
}

export interface UpdateParticipantDto extends Partial<CreateParticipantDto> {
  version?: number;
}

// Instructor
export interface Instructor extends BaseEntity {
  name: string;
  stableId: string;
  isActive?: boolean;
}

export interface CreateInstructorDto {
  name: string;
  stableId: string;
  isActive?: boolean;
}

export interface UpdateInstructorDto extends Partial<CreateInstructorDto> {
  version?: number;
}

// Activity
export interface Activity extends BaseEntity {
  name: string;
  description?: string;
  stableId: string;
  isActive?: boolean;
}

export interface CreateActivityDto {
  name: string;
  description?: string;
  stableId: string;
  isActive?: boolean;
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> {
  version?: number;
}

// Service Schedule Entry
export interface ServiceScheduleEntry extends BaseEntity {
  stableId: string;
  date: string;
  duration: string;
  serviceId: string;
  participantIds: string[];
  isActive?: boolean;
}

export interface CreateServiceScheduleEntryDto {
  stableId: string;
  date: string;
  duration: string;
  serviceId: string;
  participantIds: string[];
  isActive?: boolean;
}

export interface UpdateServiceScheduleEntryDto extends Partial<CreateServiceScheduleEntryDto> {
  version?: number;
}

// Activity Schedule Entry
export interface ActivityScheduleEntry extends BaseEntity {
  stableId: string;
  date: string;
  time: string;
  duration: number;
  instructorId: string;
  activityId: string;
  participantIds: string[];
  isActive?: boolean;
}

export interface CreateActivityScheduleEntryDto {
  stableId: string;
  date: string;
  time: string;
  duration: number;
  instructorId: string;
  activityId: string;
  participantIds: string[];
  isActive?: boolean;
}

export interface UpdateActivityScheduleEntryDto extends Partial<CreateActivityScheduleEntryDto> {
  version?: number;
}

// Service Price List
export interface ServicePriceList extends BaseEntity {
  stableId: string;
  serviceId: string;
  price: number;
  currency: string;
  isActive?: boolean;
}

export interface CreateServicePriceListDto {
  stableId: string;
  serviceId: string;
  price: number;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateServicePriceListDto extends Partial<CreateServicePriceListDto> {
  version?: number;
}

// Activity Price List
export interface ActivityPriceList extends BaseEntity {
  stableId: string;
  activityId: string;
  price: number;
  currency: string;
  isActive?: boolean;
}

export interface CreateActivityPriceListDto {
  stableId: string;
  activityId: string;
  price: number;
  currency?: string;
  isActive?: boolean;
}

export interface UpdateActivityPriceListDto extends Partial<CreateActivityPriceListDto> {
  version?: number;
}

// Individual Service Price List
export interface IndividualServicePriceList extends BaseEntity {
  stableId: string;
  participantId: string;
  serviceId?: string | null;
  price: number;
  currency: string;
}

export interface CreateIndividualServicePriceListDto {
  stableId: string;
  participantId: string;
  serviceId?: string | null;
  price: number;
  currency?: string;
}

export interface UpdateIndividualServicePriceListDto extends Partial<CreateIndividualServicePriceListDto> {
  version?: number;
}

// Individual Activity Price List
export interface IndividualActivityPriceList extends BaseEntity {
  stableId: string;
  participantId: string;
  activityId?: string | null;
  instructorId: string;
  price: number;
  currency: string;
}

export interface CreateIndividualActivityPriceListDto {
  stableId: string;
  participantId: string;
  activityId?: string | null;
  instructorId: string;
  price: number;
  currency?: string;
}

export interface UpdateIndividualActivityPriceListDto extends Partial<CreateIndividualActivityPriceListDto> {
  version?: number;
}

// Payment
export interface Payment extends BaseEntity {
  stableId: string;
  contactPersonId: string;
  amount: number;
  paymentDate: string;
}

export interface CreatePaymentDto {
  stableId: string;
  contactPersonId: string;
  amount: number;
  paymentDate: string;
}

export interface UpdatePaymentDto extends Partial<CreatePaymentDto> {
  version?: number;
}

// Balance
export interface Balance extends BaseEntity {
  contactPersonId: string;
  contactPerson?: ContactPerson;
  balance: number;
}

export interface CreateBalanceDto {
  contactPersonId: string;
  balance: number;
}

export interface UpdateBalanceDto extends Partial<CreateBalanceDto> {
  version?: number;
}
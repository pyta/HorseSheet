import api from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async refresh(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};


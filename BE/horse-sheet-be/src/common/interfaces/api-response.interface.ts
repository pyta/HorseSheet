export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
  };
}

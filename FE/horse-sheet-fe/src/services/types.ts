// API Response wrapper type matching backend TransformInterceptor
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

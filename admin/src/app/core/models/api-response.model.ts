/** Mirrors the backend's { success, data, message } envelope (docs/api/endpoints.md). */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

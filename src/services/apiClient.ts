import axios, { type AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    // Errors from the API are application/problem+json, with the reason in `detail`.
    // Spring's own 400 for invalid request values has no detail, so give a general hint then.
    const message =
      detail ??
      (status === 400 ? 'Please check the form values.' : undefined) ??
      error.response?.data?.message ??
      error.message ??
      'Something went wrong while processing the request. Please try again later.';

    return Promise.reject(new ApiError(message, status));
  },
);

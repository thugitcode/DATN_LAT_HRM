import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { ApiResponse, PaginationParams } from '@/types';
import { normalizeAxiosError } from '@/lib/axios';

export class BaseApiService<T, TParams = Record<string, unknown>> {
  constructor(
    protected instance: AxiosInstance,
    protected endpoint: string,
  ) {}

  async getAll(params?: TParams & Partial<PaginationParams>): Promise<ApiResponse<T[]>> {
    try {
      const response = await this.instance.get(this.endpoint, { params });
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async getById(id: string | number, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get(`${this.endpoint}/${id}`, config);
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async create(data: Partial<T>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post(this.endpoint, data, config);
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async update(
    id: string | number,
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put(`${this.endpoint}/${id}`, data, config);
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async patch(
    id: string | number,
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch(`${this.endpoint}/${id}`, data, config);
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async delete(id: string | number, config?: AxiosRequestConfig): Promise<ApiResponse<void>> {
    try {
      const response = await this.instance.delete(`${this.endpoint}/${id}`, config);
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async bulkDelete(
    ids: (string | number)[],
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.instance.delete(this.endpoint, {
        ...config,
        data: { ids },
      });
      return response.data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }
}

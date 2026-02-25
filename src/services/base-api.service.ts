import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { ApiResponse, PaginationParams } from '@/types';
import { normalizeAxiosError } from '@/lib/axios';

type ID = string | number;

export interface CrudService<
  T,
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
  TParams = Record<string, unknown>,
> {
  getAll(params?: TParams & Partial<PaginationParams>): Promise<ApiResponse<T[]>>;
  getById(id: ID, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  create(data: TCreate, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  update(id: ID, data: TUpdate, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  patch(id: ID, data: Partial<TUpdate>, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  delete(id: ID, config?: AxiosRequestConfig): Promise<ApiResponse<void>>;
}

export abstract class BaseApiService<
  T,
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
  TParams = Record<string, unknown>,
> implements CrudService<T, TCreate, TUpdate, TParams> {
  constructor(
    protected readonly instance: AxiosInstance,
    protected readonly endpoint: string,
  ) {}

  protected url(path?: ID): string {
    return path !== undefined ? `${this.endpoint}/${path}` : this.endpoint;
  }

  protected async request<R>(fn: () => Promise<R>): Promise<R> {
    try {
      return await fn();
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  }

  async getAll(params?: TParams & Partial<PaginationParams>): Promise<ApiResponse<T[]>> {
    return this.request(async () => {
      const res = await this.instance.get(this.url(), { params });
      return res.data;
    });
  }

  async getById(id: ID, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request(async () => {
      const res = await this.instance.get(this.url(id), config);
      return res.data;
    });
  }

  async create(data: TCreate, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request(async () => {
      const res = await this.instance.post(this.url(), data, config);
      return res.data;
    });
  }

  async update(id: ID, data: TUpdate, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request(async () => {
      const res = await this.instance.put(this.url(id), data, config);
      return res.data;
    });
  }

  async patch(
    id: ID,
    data: Partial<TUpdate>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request(async () => {
      const res = await this.instance.patch(this.url(id), data, config);
      return res.data;
    });
  }

  async delete(id: ID, config?: AxiosRequestConfig): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.delete(this.url(id), config);
      return res.data;
    });
  }

  async bulkDelete(ids: ID[], config?: AxiosRequestConfig): Promise<ApiResponse<void>> {
    return this.request(async () => {
      const res = await this.instance.delete(this.url(), {
        ...config,
        data: { ids },
      });
      return res.data;
    });
  }
}

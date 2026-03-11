import axios from 'axios';

import type { ApiResponse } from '@/types';
import { config as appConfig } from '@/lib/config';

import { BaseApiService } from './base-api.service';

const uploadInstance = axios.create({
  baseURL: window.GATEWAY + 'hrm/api/upload',
  timeout: 60000,
});

uploadInstance.interceptors.request.use((requestConfig) => {
  requestConfig.headers['x-tenant-id'] = appConfig.X_TENANT_ID;

  if (!requestConfig.headers['Content-Type']) {
    requestConfig.headers['Content-Type'] = 'multipart/form-data';
  }

  return requestConfig;
});

export interface UploadResponse {
  url: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
}

export interface UploadMultipleResponse {
  data: UploadResponse[];
}

class UploadServiceImpl extends BaseApiService<UploadResponse, FormData, unknown> {
  constructor() {
    super(uploadInstance, '');
  }

  async upload(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await this.instance.post('', formData);
    return res.data;
  }

  async uploadMultiple(files: File[]): Promise<ApiResponse<UploadResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await this.instance.post('/multiple', formData);
    return res.data;
  }

  async delete(url: string): Promise<ApiResponse<void>> {
    const res = await this.instance.delete('', { data: { url } });
    return res.data;
  }

  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<ApiResponse<string>> {
    const params = new URLSearchParams({
      filePath: filePath,
      expiresIn: expiresIn.toString(),
    });

    const res = await this.instance.get(`/signed-url?${params.toString()}`);

    return res.data;
  }
}

export const uploadService = new UploadServiceImpl();


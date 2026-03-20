import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

import { config as configApp } from './config';

export const apiTokens: {
  accessToken?: string;
  refreshToken?: string;
} = {
  accessToken: undefined,
  refreshToken: undefined,
};

export const hrmInstance = axios.create({
  baseURL: window.GATEWAY + 'hrm/api',
  // baseURL: window.GATEWAY + 'api',
  timeout: 15000,
});

hrmInstance.interceptors.request.use((config) => {
  const jwt = localStorage.getItem('jwt');

  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  if (jwt) {
    // const xTenantId = jwtDecode(jwt).partner_code;
    const xTenantId = 'noiquoctuan5';
    config.headers['x-tenant-id'] = xTenantId;

    config.headers.Authorization = `Bearer ${jwt}`;
  }

  return config;
});

hrmInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const normalizeAxiosError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message ?? error.message ?? 'Request failed';

    return new Error(message);
  }

  return new Error('Có lỗi không xác định xảy ra');
};

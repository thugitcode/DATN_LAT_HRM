import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

import { config as configApp } from './config';
import { getErrorMessage } from './utils';
import i18n from '@/i18n';

export const apiTokens: {
  accessToken?: string;
  refreshToken?: string;
} = {
  accessToken: undefined,
  refreshToken: undefined,
};

// 1. [SỬA ĐƯỜNG DẪN API]: Bẻ lái Axios gọi thẳng vào Backend Node.js của chúng ta
export const hrmInstance = axios.create({
  baseURL: 'http://localhost:3000/api', 
  timeout: 15000,
});

hrmInstance.interceptors.request.use((config) => {
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  const localJwt = localStorage.getItem('jwt');
  const token = localJwt || apiTokens.accessToken;

  if (token) {
    let xTenantId = localStorage.getItem('partner_code');

    // 2. [FIX LỖI CRASH]: Bọc try-catch và kiểm tra token xem có phải chuẩn JWT (3 phần) không
    try {
      if (typeof token === 'string' && token.split('.').length === 3) {
        const decoded: any = jwtDecode(token);
        if (decoded.partner_code) {
          xTenantId = decoded.partner_code;
        }
      }
    } catch (error) {
      console.warn("Token không phải định dạng JWT, bỏ qua bước decode.");
    }

    if (xTenantId) {
      config.headers['x-tenant-id'] = xTenantId;
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  // Đính kèm thêm thông tin user từ MySQL của chúng ta vào mọi API gửi đi
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      config.headers['x-user-id'] = user.id;
      config.headers['x-user-role'] = user.role;
    } catch (e) {}
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
    const message = getErrorMessage(error.response?.data?.message ?? error.message, i18n.t.bind(i18n)) || 'Request failed';
    return new Error(message);
  }
  return new Error('Có lỗi không xác định xảy ra');
};
import axios from 'axios';

export const apiTokens: {
  accessToken?: string;
  refreshToken?: string;
} = {
  accessToken: undefined,
  refreshToken: undefined,
};

export const clinic40Api = axios.create({
  //baseURL: window.GATEWAY + 'hrm/api',
  baseURL: 'http://localhost:4554/api',
});
export const cis = axios.create({
  baseURL: window.GATEWAY + 'cis/api',
});

clinic40Api.interceptors.request.use((config) => {
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  if (apiTokens.accessToken) {
    config.headers.Authorization = `Bearer ${apiTokens.accessToken}`;
  }
  // Hard-coded tenant ID for now
  config.headers['x-tenant-id'] = 'DEEPCARE';

  return config;
});

cis.interceptors.request.use((config) => {
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  if (apiTokens.accessToken) {
    config.headers.Authorization = `Bearer ${apiTokens.accessToken}`;
  }

  return config;
});

clinic40Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

cis.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const clinic40PublicApi = axios.create({
  baseURL: window.GATEWAY + 'clinic40-public/api',
  // baseURL: 'http://localhost:8081/api',
});

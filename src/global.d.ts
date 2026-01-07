declare global {
  interface Window {
    NODE_ENV: 'dev' | 'prod';
    GATEWAY: string;
    CIS_WEB_UI_URL: string;
    KEYCLOAK_URL: string;
    KEYCLOAK_REALM: string;
    KEYCLOAK_CLIENT_ID: string;
    KHOANG_NGAY_TINH_NGAY_SAP_HET_HAN_LICENSE: number;
  }
}

declare module 'keycloak-js' {
  interface KeycloakTokenParsed {
    email?: string;
    email_verified?: boolean;
    exp?: number;
    family_name?: string;
    given_name?: string;
    module?: string[];
    name?: string;
    preferred_username?: string;
    tenant_code?: string;
  }
}

export {};

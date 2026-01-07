import type { KeycloakTokenParsed } from "keycloak-js";

import type { UserDetailItem } from "./user.type";

export type AuthContext = {
  isLoggedIn: boolean;
  tokenPayload?: KeycloakTokenParsed;
  accessToken?: string;
  refreshToken?: string;
  logout: () => void;
};

export interface Identity extends UserDetailItem {}

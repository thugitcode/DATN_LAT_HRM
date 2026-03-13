import { ReactKeycloakProvider } from '@react-keycloak/web';

import { keycloakClient } from '@/lib/keycloak';
import { logger } from '@/lib/logger';

type Props = React.PropsWithChildren;

export const KeycloakProvider = ({ children }: Props) => {
  return (
    <ReactKeycloakProvider
      authClient={keycloakClient}
      LoadingComponent={<div className="h-screen">Hệ thống đang xác thực...</div>}
      autoRefreshToken={false}
      onEvent={(event, error) => {
        logger.log('Keycloak Event:', event, error);
      }}
    >
      {children}
    </ReactKeycloakProvider>
  );
};

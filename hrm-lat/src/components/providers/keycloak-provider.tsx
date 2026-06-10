import { ReactKeycloakProvider } from '@react-keycloak/web';

import { keycloakClient } from '@/lib/keycloak';
import { logger } from '@/lib/logger';

import { KeycloakLoadingScreen } from '../keycloak-loading-screen';

type Props = React.PropsWithChildren;

export const KeycloakProvider = ({ children }: Props) => {
  return (
    <ReactKeycloakProvider
      authClient={keycloakClient}
      LoadingComponent={<KeycloakLoadingScreen />}
      autoRefreshToken={false}
      onEvent={(event, error) => {
        logger.log('Keycloak Event:', event, error);
      }}
    >
      {children}
    </ReactKeycloakProvider>
  );
};

import { ReactKeycloakProvider } from '@react-keycloak/web';

import { keycloakClient } from '@/lib/keycloak';
import { logger } from '@/lib/logger';
import { DISABLE_AUTH } from '@/lib/utils';

import { CommonInitializingComponent } from '../common/common-initializing-component';

type Props = React.PropsWithChildren;

export const KeycloakProvider = ({ children }: Props) => {
  if (DISABLE_AUTH) {
    return <>{children}</>;
  }
  return (
    <ReactKeycloakProvider
      authClient={keycloakClient}
      LoadingComponent={
        <CommonInitializingComponent h="100dvh" title="Hệ thống đang xác thực..." />
      }
      autoRefreshToken={false}
      onEvent={(event, error) => {
        logger.log('Keycloak Event:', event, error);
      }}
    >
      {children}
    </ReactKeycloakProvider>
  );
};

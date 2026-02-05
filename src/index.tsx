import './styles/global.css';
import './lib/dayjs';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app';
import { KeycloakProvider } from './components/providers/keycloak-provider';

// import { ThemeProvider } from './components/providers/theme-provider';

const rootEl = document.getElementById('root');

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);

  root.render(
    // <ThemeProvider>
    // <KeycloakProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    // </KeycloakProvider>,
    // </ThemeProvider>,
  );
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { initI18N } from './init-i18n';

initI18N().then(() => {
  const root = createRoot(document.getElementById('app')!);
  root.render(<App endUser={true} />);
});

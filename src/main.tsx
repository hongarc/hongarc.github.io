import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app';
import './index.css';

// Log build info for debugging
console.info(
  '%c🛠️ Friendly Toolbox',
  'font-weight: bold; font-size: 14px;',
  `\n📦 Build: ${__GIT_HASH__}\n🕐 Time: ${__BUILD_TIME__}\n🌐 Env: ${__BUILD_ENV__}`
);

const rootElement = document.querySelector('#root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Get basename from Vite's base config (import.meta.env.BASE_URL includes trailing slash)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

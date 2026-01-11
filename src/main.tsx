import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app';
import './index.css';

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

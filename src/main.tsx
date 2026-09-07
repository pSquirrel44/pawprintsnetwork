import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';
import { initNativeBridge } from './utils/nativeBridge';
import { createClerkConfig } from './auth/clerkConfig';

// No-op in a regular browser tab; wires up splash screen / status bar /
// Android back button when running inside the iOS or Android app.
initNativeBridge();

const clerkConfig = createClerkConfig(import.meta.env, new URL(window.location.href));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider {...clerkConfig}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);

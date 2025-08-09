import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { WalletProvider } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

const GOOGLE_CLIENT_ID = '932006901435-miijfmeofbbgs07difqp56lpj8406jj7.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* <App /> is now a child of GoogleOAuthProvider */}
      <WalletProvider>
        <App />
      </WalletProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

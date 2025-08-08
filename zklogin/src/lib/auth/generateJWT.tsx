// src/lib/auth/generateJWT.tsx

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { type ZkLoginSetup } from '../ephemeralKey';

type GoogleJwtLoginProps = {
  onSuccess: (jwt: string) => void;
  setupData: ZkLoginSetup;
};

export function GoogleJwtLogin({ onSuccess, setupData }: GoogleJwtLoginProps) {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const jwt = credentialResponse.credential;
      onSuccess(jwt);
    } else {
      console.error("JWT credential is missing.");
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
  };

  // The nonce is already correctly generated in ephemeralKey.ts and passed in setupData
  const nonce = setupData.nonce;

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      nonce={nonce}
    />
  );
}
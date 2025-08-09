// src/lib/auth/createZkProof.tsx

import { getZkLoginSignature, jwtToAddress } from '@mysten/sui/zklogin';
import { type ZkLoginSetup } from '../ephemeralKey';
import { toB64, fromB64 } from '@mysten/sui/utils';

const PROVER_URL = 'https://prover-dev.mystenlabs.com/v1';

function numberToUint8Array(num: BigInt): Uint8Array {
  const hex = num.toString(16);
  const hexPadded = hex.padStart(Math.ceil(hex.length / 2) * 2, '0');
  const arr = new Uint8Array(hexPadded.length / 2);
  for (let i = 0; i < hexPadded.length; i += 2) {
    arr[i / 2] = parseInt(hexPadded.substring(i, i + 2), 16);
  }
  return arr;
}


export function toBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generateProof(jwt: string, setupData: ZkLoginSetup) {
  const [header, payload, signature] = jwt.split('.');
  const decodedPayload = JSON.parse(atob(payload));
  
  
  let salt = localStorage.getItem('zklogin-salt');
  if (!salt) {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const newSalt = BigInt('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
    salt = newSalt.toString();
    localStorage.setItem('zklogin-salt', salt);
  }

  const userSuiAddress = jwtToAddress(jwt, salt);
  console.log("Derived Sui Address:", userSuiAddress);


  const requestBody = {
    jwt,
    extendedEphemeralPublicKey: toBase64Url(setupData.ephemeralKeyPair.getPublicKey().toBase64()),
    maxEpoch: setupData.maxEpoch,
    salt: toBase64Url(toB64(numberToUint8Array(BigInt(salt)))),
    jwtRandomness: toBase64Url(toB64(numberToUint8Array(BigInt(setupData.randomness)))),
    aud: decodedPayload.aud,
    iss: decodedPayload.iss,
    keyClaimName: "sub",
  };
  
  console.log("Request Payload:", requestBody);


  try {
    const proofResponse = await fetch(PROVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!proofResponse.ok) {
        const errorText = await proofResponse.text();
        console.error("Prover Service Error:", proofResponse.status, errorText);
        throw new Error(`Prover service returned an error: ${proofResponse.status} ${errorText}`);
    }

    const { proofPoints } = await proofResponse.json();

    return { proofPoints, userSuiAddress, salt, decodedPayload };
  } catch (error) {
    console.error("Failed to fetch from prover service:", error);
    throw error;
  }
}
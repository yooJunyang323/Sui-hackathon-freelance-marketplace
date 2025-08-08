import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const FULLNODE_URL = 'https://fullnode.devnet.sui.io'; 
const suiClient = new SuiClient({ url: FULLNODE_URL });

export interface ZkLoginSetup {
  ephemeralKeyPair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  nonce: string;
}

export const createZkLoginSetup = async (): Promise<ZkLoginSetup> => {
  const { epoch } = await suiClient.getLatestSuiSystemState();
  const maxEpoch = Number(epoch) + 2;

  const ephemeralKeyPair = new Ed25519Keypair();
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

  return {
    ephemeralKeyPair,
    maxEpoch,
    randomness,
    nonce,
  };
}
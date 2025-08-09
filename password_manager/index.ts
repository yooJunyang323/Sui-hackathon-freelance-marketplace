import { encrypt, decrypt } from "./seal";
import { storeEncryptedRepo, fetchEncryptedRepo } from "./walrus";

// your other imports and app code here

// On user login
export async function onUserLogin(userAddress: string, repoUrl: string) {
  // Encrypt repo link with user address key
  const encryptedRepo = encrypt(repoUrl, userAddress);

  // Store encrypted repo on Walrus server
  await storeEncryptedRepo(userAddress, encryptedRepo);
}

// When user accepts completion and needs the repo link decrypted
export async function onAcceptCompletion(userAddress: string) {
  // Fetch encrypted repo link from Walrus
  const encryptedRepo = await fetchEncryptedRepo(userAddress);
  if (!encryptedRepo) throw new Error("No encrypted repo found");

  // Decrypt using user address key
  const decryptedRepo = decrypt(encryptedRepo, userAddress);

  // Return or use decrypted repo URL securely
  return decryptedRepo;
}

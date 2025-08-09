// import { encrypt, decrypt } from "./seal";
// import { storeEncryptedRepo, fetchEncryptedRepo } from "./walrus";

// // your other imports and app code here

// // On user login
// export async function onUserLogin(userAddress: string, repoUrl: string) {
//   // Encrypt repo link with user address key
//   const encryptedRepo = encrypt(repoUrl, userAddress);

//   // Store encrypted repo on Walrus server
//   await storeEncryptedRepo(userAddress, encryptedRepo);
// }

// // When user accepts completion and needs the repo link decrypted
// export async function onAcceptCompletion(userAddress: string) {
//   // Fetch encrypted repo link from Walrus
//   const encryptedRepo = await fetchEncryptedRepo(userAddress);
//   if (!encryptedRepo) throw new Error("No encrypted repo found");

//   // Decrypt using user address key
//   const decryptedRepo = decrypt(encryptedRepo, userAddress);

//   // Return or use decrypted repo URL securely
//   return decryptedRepo;
// }

import { encrypt, decrypt } from "./seal";
import { storeEncryptedRepo, fetchEncryptedRepo } from "./walrus";

// This function fetches the encrypted repo URL and decrypts it for display
export async function onAcceptCompletion(userAddress: string, orderId: string) {
  try {
    // Fetch encrypted repo link from Walrus server using composite key
    const encryptedRepo = await fetchEncryptedRepo(userAddress, orderId);
    if (!encryptedRepo) {
      throw new Error("No encrypted repo found for this order");
    }

    // Decrypt using the user address key
    const decryptedRepoUrl = decrypt(encryptedRepo, userAddress);

    // Now you can display or return the decrypted repo URL safely to the user
    console.log("Decrypted GitHub Repo URL:", decryptedRepoUrl);
    return decryptedRepoUrl;
  } catch (error) {
    console.error("Failed to decrypt or fetch repo URL:", error);
    throw error;
  }
}


// Usage in UI 
// async function handleAcceptCompletion(userAddress: string, orderId: string) {
//   const repoUrl = await onAcceptCompletion(userAddress, orderId);
//   alert(`Here is the delivered GitHub repo URL:\n${repoUrl}`);
// }


import { encrypt, decrypt } from "./seal";
import { storeEncryptedRepo, fetchEncryptedRepo } from "./walrus";

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


export async function storeOrderData(
  userAddress: string,
  orderId: string,
  repoUrl: string,
  commitHash: string
) {
  const encryptedData = encrypt({ repoUrl, commitHash }, userAddress);
  await storeEncryptedRepo(userAddress, orderId, encryptedData);
}

export async function onAcceptCompletion(userAddress: string, orderId: string) {
  try {
    const encryptedData = await fetchEncryptedRepo(userAddress, orderId);
    if (!encryptedData) throw new Error("No encrypted data found for this order");

    const { repoUrl, commitHash } = decrypt(encryptedData, userAddress);

    console.log("Decrypted GitHub Repo URL:", repoUrl);
    console.log("Decrypted Git Commit Hash:", commitHash);

    return { repoUrl, commitHash };
  } catch (error) {
    console.error("Failed to decrypt or fetch repo data:", error);
    throw error;
  }
}




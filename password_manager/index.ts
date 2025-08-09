import { encrypt, decrypt } from "./seal";
import { storeEncryptedRepo, fetchEncryptedRepo } from "./walrus";


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

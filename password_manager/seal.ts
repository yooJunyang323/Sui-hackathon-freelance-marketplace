import { Buffer } from "buffer";
if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}
// your other imports and app code here

import crypto from "crypto";

const algorithm = "aes-256-gcm";

// Derive a key from user address (use a hash or KDF)
function deriveKey(address: string): Buffer {
  // Simple example: hash address with SHA-256 for 32-byte key
  return crypto.createHash("sha256").update(address).digest();
}

export function encrypt(repoUrl: string, userAddress: string): string {
  const key = deriveKey(userAddress);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(repoUrl, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Store iv + tag + encrypted hex all together for decryption
  return iv.toString("hex") + tag.toString("hex") + encrypted;
}

export function decrypt(encryptedData: string, userAddress: string): string {
  const key = deriveKey(userAddress);
  const iv = Buffer.from(encryptedData.slice(0, 24), "hex");
  const tag = Buffer.from(encryptedData.slice(24, 56), "hex");
  const encrypted = encryptedData.slice(56);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

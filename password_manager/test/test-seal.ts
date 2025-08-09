// run in terminal under test directory: 
// npx ts-node test-seal.ts 
import { encrypt, decrypt } from "../seal";  // adjust import as needed

const userAddress = "0x123abc";
const data = {
  repoUrl: "https://github.com/user/repo",
  commitHash: "abcdef1234567890",
};

const encrypted = encrypt(data, userAddress);
console.log("Encrypted:", encrypted);

const decrypted = decrypt(encrypted, userAddress);
console.log("Decrypted:", decrypted);

// Verify decrypted equals original data
console.assert(decrypted.repoUrl === data.repoUrl, "Repo URL mismatch");
console.assert(decrypted.commitHash === data.commitHash, "Commit Hash mismatch");
console.log("Seal encryption/decryption test passed!");

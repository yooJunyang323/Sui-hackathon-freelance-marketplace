// import { encrypt, decrypt } from "../seal";
// import { storeEncryptedRepo, fetchEncryptedRepo } from "../walrus";

// const testUserAddress = "0xea2b51710e5a7678ba014cf6be33492271bb6a07c6c451b70ac713785e5e39a4";
// const testRepoUrl = "https://github.com/sample/buyer-repo123";

// async function testEncryptionFlow() {
//   try {
//     console.log("Testing encryption with user address:", testUserAddress);
//     console.log("Repo URL to encrypt:", testRepoUrl);
//     console.log();

//     // Encrypt the repo URL
//     const encrypted = encrypt(testRepoUrl, testUserAddress);
//     console.log("Encrypted repo:", encrypted);

//     // Store encrypted repo on Walrus
//     const storeResult = await storeEncryptedRepo(testUserAddress, encrypted);
//     console.log("Store result from Walrus:", storeResult);

//     // Fetch back from Walrus
//     const fetchedEncrypted = await fetchEncryptedRepo(testUserAddress);
//     console.log("Fetched encrypted repo:", fetchedEncrypted);

//      // Debug logs for checking length and equality
//     console.log("Encrypted before storing length:", encrypted.length);
//     console.log("Fetched encrypted length:", fetchedEncrypted?.length);
//     console.log();
//     console.log("Encrypted before storing:", encrypted);
//     console.log("Fetched encrypted:", fetchedEncrypted);
//     console.log("Encrypted strings equal:", encrypted === fetchedEncrypted);
//     console.log();


//     // Decrypt fetched repo
//     const decrypted = decrypt(fetchedEncrypted!, testUserAddress);
//     console.log("Decrypted repo URL:", decrypted);

//     // Confirm decrypted matches original repo URL
//     if (decrypted === testRepoUrl) {
//       console.log("✅ Decryption successful and matches original repo URL.");
//     } else {
//       console.error("❌ Decryption failed or mismatch.");
//     }
//   } catch (error) {
//     console.error("Test failed:", error);
//   }
// }

// testEncryptionFlow();

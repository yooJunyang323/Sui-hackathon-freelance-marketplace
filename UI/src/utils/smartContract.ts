// smartContract.ts
import {
  JsonRpcProvider,
  RawSigner,
  Connection,
  TransactionBlock,
} from "@mysten/sui";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// Load credentials from environment variables for security
const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY;
const SUI_PACKAGE_ID = process.env.SUI_PACKAGE_ID;

if (!SUI_PRIVATE_KEY || !SUI_PACKAGE_ID) {
  throw new Error("SUI_PRIVATE_KEY and SUI_PACKAGE_ID must be set in environment variables");
}

// Set up the connection to a Sui network (e.g., devnet)
const connection = new Connection({
  fullnode: "https://fullnode.devnet.sui.io:443",
});
const provider = new JsonRpcProvider(connection);

// Create a signer from the private key
const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(SUI_PRIVATE_KEY, "hex"));
const signer = new RawSigner(keypair, provider);

export const callSmartContract = async (functionName: string, params: any[] = []) => {
  console.log(`Calling real Sui function: ${functionName}`, params);

  const tx = new TransactionBlock();

  try {
    // This switch statement now builds a real transaction block
    switch (functionName) {
      case 'create_marketplace':
        tx.moveCall({
          target: `${SUI_PACKAGE_ID}::marketplace::create_marketplace`,
          arguments: [],
        });
        break;
      case 'add_user':
        // params[0] would be the user's address, for example
        tx.moveCall({
          target: `${SUI_PACKAGE_ID}::marketplace::add_user`,
          arguments: params,
        });
        break;
      // You must add cases for all your other functions here
      // For each function, you define the correct target and arguments
      case 'list_service':
        tx.moveCall({
          target: `${SUI_PACKAGE_ID}::marketplace::list_service`,
          arguments: params,
        });
        break;
      case 'purchase_service':
        tx.moveCall({
          target: `${SUI_PACKAGE_ID}::marketplace::purchase_service`,
          arguments: params,
        });
        break;
      // Add more cases for the rest of your functions...
      default:
        return { success: false, message: `Unknown function: ${functionName}` };
    }

    // Sign and execute the transaction block
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

    console.log("Transaction successful:", result);
    return { success: true, message: `${functionName} executed successfully`, data: result };

  } catch (error) {
    console.error("Transaction failed:", error);
    return { success: false, message: `Transaction failed: ${error.message}` };
  }
};
import {
  SuiClient,
  getFullnodeUrl,
  SuiTransactionBlockResponse,
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// This is the well-known object ID for the global Sui Clock object.
const SUI_CLOCK_OBJECT_ID = '0x6';

// This function needs to be outside of the contract call or passed in
// For a dApp, this keypair would be handled by a wallet SDK
const keypair = Ed25519Keypair.generate();
const PACKAGE_ID = "0x3bcb920bef49d3921c412d90053403d6335e54466322b6a0c6dfea8dd2c175e1";
const MODULE_NAME = "marketplace";

// Initialize a provider to connect to a Sui network
const rpcUrl = getFullnodeUrl('devnet');
const client = new SuiClient({ url: rpcUrl });

export const callSmartContract = async (
  functionName: string,
  newAddress: string,
  params: any[] = []
) => {
  console.log(`Calling smart contract function: ${functionName}`, params);

  switch (functionName) {
    case 'create_marketplace':
      return callCreateMarketplace(params);
    case 'add_freelancer':
      return callAddFreelancer(newAddress);
    case 'add_buyer':
      return callAddBuyer(newAddress);
    case 'add_admin':
      return callAddAdmin(newAddress);
    default:
      return { success: false, message: 'Unknown function' };
  }
};
// ============================= ADMIN FUNCTION =============================
const callCreateMarketplace = async (params: any[]) => {
  const transaction = new Transaction();

  // Replace with your actual package, module, and function names
  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const marketplaceFunctionName = 'create_marketplace';

  // Build the moveCall command within the transaction
  transaction.moveCall({
    target: `${packageId}::${moduleName}::${marketplaceFunctionName}`,
    arguments: [], // Add your arguments here if the function takes any
    typeArguments: [], // Add generic type arguments if needed
  });

  try {
    // Execute the transaction
    const result = await client.signAndExecuteTransaction({
      transaction,
      signer: keypair,
    });

    console.log('Transaction result:', result);
    return {
      success: true,
      message: 'Marketplace created successfully',
      digest: result.digest, // The unique transaction ID
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return { success: false, message: 'Transaction failed', error: error };
  }
};

// Function to call the 'add_freelancer' Sui Move function
const callAddFreelancer = async (newFreelancerAddress: string) => {
  const transaction = new Transaction();

  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const functionName = 'add_freelancer';

    transaction.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      transaction.pure.address(newFreelancerAddress),
    ],
  });

  try {
  const result = await client.signAndExecuteTransaction({
      transaction,
      signer: keypair,
    });
  console.log('Transaction result:', result);
    return { success: true, message: 'Freelancer added successfully', digest: result.digest };
  } catch (error) {
    console.error('Transaction failed:', error);
    return { success: false, message: 'Failed to add freelancer', error: error };
  }
};

// Function to call the 'add_buyer' Sui Move function
const callAddBuyer = async (newBuyerAddress: string) => {
  const transaction = new Transaction();

  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const functionName = 'add_buyer';

  // Build the moveCall command
  transaction.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      transaction.pure.address(newBuyerAddress),
    ],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      transaction,
      signer: keypair,
    });
    console.log('Transaction result:', result);
    return { success: true, message: 'Buyer added successfully', digest: result.digest };
  } catch (error) {
    console.error('Transaction failed:', error);
    return { success: false, message: 'Failed to add buyer', error: error };
  }
};

const callAddAdmin = async (adminAddress: string) => {
  const transaction = new Transaction();

  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const functionName = 'add_admin';

  transaction.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [
      transaction.pure.address(adminAddress),
    ],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      transaction,
      signer: keypair,
    });
    console.log('Transaction result:', result);
    return { success: true, message: 'Admin added successfully', digest: result.digest };
  } catch (error) {
    console.error('Transaction failed:', error);
    return { success: false, message: 'Failed to add admin', error: error };
  }
};

// ============================= BUYER FUNCTION =============================
/**
 * Constructs and signs a transaction to purchase a service on the marketplace.
 *
 * @param client The SuiClient instance.
 * @param keypair The Ed25519Keypair of the buyer.
 * @param packageObjectId The ID of your deployed Move package.
 * @param coinType The coin type of the payment (e.g., '0x2::sui::SUI').
 * @param marketplaceId The object ID of the marketplace.
 * @param buyerCapId The object ID of the buyer's capability.
 * @param serviceId The object ID of the service to purchase.
 * @param price The price of the service (in the coin's smallest unit).
 * @param requirementsUrl The URL to the service requirements as a string.
 * @returns The signed transaction block response.
 */
export async function callPurchaseService(
  client: SuiClient,
  keypair: Ed25519Keypair,
  coinType: string,
  buyerCapId: string,
  serviceId: string,
  price: number,
  requirementsUrl: string,
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction();

  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const functionName = 'purchase_service';
  // Create a new coin object from the gas coin to use as payment.
  // The price is in u64, so we must pass it as a number.
  // The SDK will handle the splitting of the coin.
  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

  // The requirements_url is a vector<u8> in Move, which is a byte array.
  // We must convert the string to a Uint8Array before passing it to tx.pure().
  const requirementsUrlBytes = tx.pure(new TextEncoder().encode(requirementsUrl));

  // Call the `purchase_service` function from your Move module.
  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    typeArguments: [coinType],
    arguments: [
      tx.object(buyerCapId),
      tx.object(serviceId),
      payment, // Pass the coin object we just created.
      requirementsUrlBytes,
      tx.object(SUI_CLOCK_OBJECT_ID), // The global Clock object
    ],
  });

  // Sign and execute the transaction.
  return await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    requestType: 'WaitForLocalExecution',
    options: {
      showEffects: true,
    },
  });
}

/**
 * Example usage of the callPurchaseService function.
 * You would need to replace these placeholder values with real data from your app.
 */
async function main() {
  // Replace with your client, keypair, and object IDs.
  const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
  const myPrivateKey = "suiprivkey1q..."; // Your private key.
  const keypair = Ed25519Keypair.fromSecretKey(myPrivateKey);
  const coinType = "0x2::sui::SUI"; // Example: using SUI as the payment coin.
  const buyerCapId = "0x...";
  const serviceId = "0x...";
  const price = 10000; // 10000 MIST (0.00001 SUI)
  const requirementsUrl = "https://example.com/requirements/123";

  try {
    const response = await callPurchaseService(
      client,
      keypair,
      coinType,
      buyerCapId,
      serviceId,
      price,
      requirementsUrl,
    );
    console.log("Purchase transaction submitted successfully!");
    console.log("Digest:", response.digest);

    if (response.effects?.status.status !== 'success') {
        console.error("Transaction failed:", response.effects?.status.error);
    } else {
        console.log("Transaction successful!");
    }
  } catch (error) {
    console.error("Failed to purchase service:", error);
  }
}
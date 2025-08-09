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
const MARKETPLACE_ID = "0x...";
// Initialize a provider to connect to a Sui network
const rpcUrl = getFullnodeUrl('devnet');
const client = new SuiClient({ url: rpcUrl });

// Define a type for a consistent response object.
interface CallResult {
  success: boolean;
  message: string;
  digest?: string;
  error?: any;
}

// ============================= ADMIN FUNCTION =============================
const callCreateMarketplace = async (params: any[]): Promise<CallResult> => {
  const transaction = new Transaction();
  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const marketplaceFunctionName = 'create_marketplace';

  transaction.moveCall({
    target: `${packageId}::${moduleName}::${marketplaceFunctionName}`,
    arguments: [],
    typeArguments: [],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      transaction,
      signer: keypair,
    });
    console.log('Transaction result:', result);
    return {
      success: true,
      message: 'Marketplace created successfully',
      digest: result.digest,
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return { success: false, message: 'Transaction failed', error: error };
  }
};

// Function to call the 'add_freelancer' Sui Move function
const callAddFreelancer = async (newFreelancerAddress: string): Promise<CallResult> => {
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
const callAddBuyer = async (newBuyerAddress: string): Promise<CallResult> => {
  const transaction = new Transaction();
  const packageId = PACKAGE_ID;
  const moduleName = MODULE_NAME;
  const functionName = 'add_buyer';

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

const callAddAdmin = async (adminAddress: string): Promise<CallResult> => {
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
 * @param coinType The coin type of the payment (e.g., '0x2::sui::SUI').
 * @param buyerCapId The object ID of the buyer's capability.
 * @param serviceId The object ID of the service to purchase.
 * @param price The price of the service (in the coin's smallest unit).
 * @param requirementsUrl The URL to the service requirements as a string.
 * @returns The signed transaction block response.
 */
const callPurchaseService = async (
  client: SuiClient,
  keypair: Ed25519Keypair,
  coinType: string,
  buyerCapId: string,
  serviceId: string,
  price: number,
  requirementsUrl: string,
): Promise<CallResult> => {
  const tx = new Transaction();
  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
  const requirementsUrlBytes = tx.pure(new TextEncoder().encode(requirementsUrl));

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::purchase_service`,
    typeArguments: [coinType],
    arguments: [
      tx.object(MARKETPLACE_ID),
      tx.object(buyerCapId),
      tx.object(serviceId),
      payment,
      requirementsUrlBytes,
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      requestType: 'WaitForLocalExecution',
      options: {
        showEffects: true,
      },
    });

    if (result.effects?.status.status !== 'success') {
      return {
        success: false,
        message: 'Transaction failed: ' + result.effects?.status.error,
        error: result.effects?.status.error,
      };
    } else {
      return {
        success: true,
        message: 'Transaction submitted successfully!',
        digest: result.digest,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during the transaction',
      error: error,
    };
  }
}

// ============================= FREELANCER FUNCTION =============================
const callListService = async (
  client: SuiClient,
  keypair: Ed25519Keypair,
  freelancerCapId: string,
  title: string,
  description: string,
  price: number,
  deliverables: string,
  expectedTime: number,
): Promise<CallResult> => {
  const tx = new Transaction();

  // Convert string inputs to byte arrays for the Move contract
  const titleBytes = tx.pure(new TextEncoder().encode(title));
  const descriptionBytes = tx.pure(new TextEncoder().encode(description));
  const deliverablesBytes = tx.pure(new TextEncoder().encode(deliverables));

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::list_service`,
    typeArguments: [],
    arguments: [
      tx.object(freelancerCapId),
      tx.object(MARKETPLACE_ID),
      titleBytes,
      descriptionBytes,
      tx.pure.u64(price),
      deliverablesBytes,
      tx.pure.u64(expectedTime),
    ],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      requestType: 'WaitForLocalExecution',
      options: {
        showEffects: true,
      },
    });

    if (result.effects?.status.status !== 'success') {
      return {
        success: false,
        message: 'Transaction failed: ' + result.effects?.status.error,
        error: result.effects?.status.error,
      };
    } else {
      return {
        success: true,
        message: 'Service listed successfully!',
        digest: result.digest,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during the transaction',
      error: error,
    };
  }
}

const callWithdrawService = async (
  client: SuiClient,
  keypair: Ed25519Keypair,
  freelancerCapId: string,
  serviceId: string,
): Promise<CallResult> => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::withdraw_service`,
    typeArguments: [],
    arguments: [
      tx.object(freelancerCapId),
      tx.object(MARKETPLACE_ID),
      tx.object(serviceId),
    ],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      requestType: 'WaitForLocalExecution',
      options: {
        showEffects: true,
      },
    });

    if (result.effects?.status.status !== 'success') {
      return {
        success: false,
        message: 'Transaction failed: ' + result.effects?.status.error,
        error: result.effects?.status.error,
      };
    } else {
      return {
        success: true,
        message: 'Service withdrawn successfully!',
        digest: result.digest,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during the transaction',
      error: error,
    };
  }
}

// This is the core smart contract caller that now includes `purchase_service`
export const callSmartContract = async (
  functionName: string,
  newAddress: string,
  params: any[] = []
): Promise<CallResult> => {
  console.log(`Calling smart contract function: ${functionName}`, params);

  switch (functionName) {
    case 'create_marketplace':
      return await callCreateMarketplace(params);
    case 'add_freelancer':
      return await callAddFreelancer(newAddress);
    case 'add_buyer':
      return await callAddBuyer(newAddress);
    case 'add_admin':
      return await callAddAdmin(newAddress);
    case 'purchase_service':
      const [serviceId, price, requirementsUrl] = params;
      const buyerCapId = "0x..."; // This needs to be provided by the app's state
      const coinType = "0x2::sui::SUI"; // This should also be a variable
      
      return await callPurchaseService(
        client,
        keypair,
        coinType,
        buyerCapId,
        serviceId,
        price,
        requirementsUrl
      );
    case 'list_service':
      const [freelancerCapId, title, description, price_list, deliverables, expectedTime] = params;
      return await callListService(
        client,
        keypair,
        freelancerCapId,
        title,
        description,
        price_list,
        deliverables,
        expectedTime,
      );
    case 'withdraw_service':
      const [freelancerCapId_withdraw, serviceId_withdraw] = params;
      return await callWithdrawService(
        client,
        keypair,
        freelancerCapId_withdraw,
        serviceId_withdraw,
      );
    default:
      return { success: false, message: 'Unknown function' };
  }
};

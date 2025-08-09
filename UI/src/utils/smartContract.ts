import {
  SuiClient,
  getFullnodeUrl,
} from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

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
    default:
      return { success: false, message: 'Unknown function' };
  }
};

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

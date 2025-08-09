// smartContract.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Initialize Sui client (use your preferred RPC endpoint)
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

/**
 * Calls a Sui Move function on-chain.
 * @param packageId The on-chain package ID (string, e.g. "0x123...")
 * @param moduleName The Move module name (string)
 * @param functionName The Move function name (string)
 * @param args The arguments for the Move function (array)
 * @param signer The wallet signer (from your wallet adapter)
 * @returns The transaction response from Sui
 */
export const callSuiMoveFunction = async (
  packageId: string,
  moduleName: string,
  functionName: string,
  args: any[],
  signer: any // e.g. from wallet adapter, like SuiWallet, Suiet, etc.
) => {
  // Build the transaction block
  const txb = new TransactionBlock();
  txb.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: args.map(arg => txb.pure(arg)),
  });

  // Sign and execute the transaction block
  const result = await signer.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    options: { showEffects: true, showEvents: true },
  });

  return result;
};
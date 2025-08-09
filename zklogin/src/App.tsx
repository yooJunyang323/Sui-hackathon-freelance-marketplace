// src/App.tsx
import React, { useState, useEffect } from 'react';
import { createZkLoginSetup, type ZkLoginSetup } from './lib/ephemeralKey';
import { GoogleJwtLogin } from './lib/auth/generateJWT';
import './App.css';
import { generateProof } from './lib/auth/createZkProof';
import { ConnectButton } from "@suiet/wallet-kit";
import { useWallet } from "@suiet/wallet-kit";
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { requestSuiFromFaucetV0, getFaucetHost } from '@mysten/sui/faucet';
import { Transaction} from '@mysten/sui/transactions';

const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io'});
const PACKAGE_ID = '0x3bcb920bef49d3921c412d90053403d6335e54466322b6a0c6dfea8dd2c175e1';
const MODULE_NAME = "marketplace";

const fetchCaps = (address: string) => {
  return new Promise<string | null>((resolve) => {
    const check = async() => {
      const freelancerCapType = `${PACKAGE_ID}::${MODULE_NAME}::FreelancerCap`;
      const buyerCapType = `${PACKAGE_ID}::${MODULE_NAME}::BuyerCap`;

      try {
        const freelancerCaps = await client.getOwnedObjects({
          owner: address,
          filter: { StructType: freelancerCapType},
        });

        const buyerCaps = await client.getOwnedObjects({
          owner: address,
          filter: { StructType: buyerCapType},
        });

        if (freelancerCaps.data.length > 0) {
          resolve('freelancer');
          return;
        }
        if (buyerCaps.data.length > 0) {
          resolve('buyer');
          return;
        }
        resolve(null);
      } catch (error) {
        console.error('Failed to fetch caps:', error);
        resolve(null);
      }
    }
    check();
  });
};

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [setupData, setSetupData] = useState<ZkLoginSetup | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [suiAddress, setSuiAddress] = useState<string | null>(null);

  const wallet = useWallet();
  const [extensionAddress, setExtensionAddress] = useState<string | null>(null);
  const [googleAddress, setGoogleAddress ] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState<boolean>(false);
  const [zkLoginRoleChecked, setZkLoginRoleChecked] = useState<boolean>(false);

  async function requestFaucetCoins(address: string) {
    try {
      console.log("Requesting from faucet for:", address);
      const response = await fetch('https://faucet.devnet.sui.io/v2/gas',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: address.toLowerCase(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Faucet request failed: ${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      console.log('Faucet response:', result);
      return result;
    } catch (error) {
      console.error("Faucet request error:", error);
      throw error;
    }
  }

  useEffect(() => {
    console.log('wallet changed:', {
      connected: wallet.connected,
      account: wallet.account,
    });
    setExtensionAddress(wallet.account?.address ?? null);
  }, [wallet.connected, wallet.account]);


  const handleCheckRole = async () => {
    setRoleChecked(true);
    setZkLoginRoleChecked(false);
    if (!extensionAddress) {
      setRole(null);
      return;
    }
    setIsLoading(true);
    console.log("The set is loading is running");
    const userRole = await fetchCaps(extensionAddress);
    await requestFaucetCoins(extensionAddress);
    setRole(userRole);
    console.log("The userRole is:",userRole);
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setRoleChecked(false);
    try {
      const data = await createZkLoginSetup();
      setSetupData(data);
      console.log("Ephemeral key and nonce generated:", data);
    } catch (error) {
      console.error("Failed to set up zkLogin:", error);
    }
  };

  const handleJwt = async (jwtStr: string) => {
    console.log("JWT received:", jwtStr);
    setJwt(jwtStr);

    if (setupData) {
      try {
        const { proofPoints, userSuiAddress } = await generateProof(jwtStr, setupData);
        setSuiAddress(userSuiAddress);
        setGoogleAddress(userSuiAddress);
        console.log("Sui Address (zkLogin):", userSuiAddress);
        console.log("ZkProof received:", proofPoints);
        console.log("Calling out the requestFaucetCoins");
        const first_time = await fetchCaps(userSuiAddress);
        setRole(first_time);
        setZkLoginRoleChecked(true);
        console.log("This is the first time:",first_time);

        if (first_time === null) {
          await requestFaucetCoins(userSuiAddress);
        }
      } catch (error) {
        console.error("Failed to generate proof or get Sui address:", error);
      }
    }
  };
  
  // FIX: Refactored the function to correct the syntax error and use component state
  const handleRoleSelection = async (selectedRole: string) => {
    setRole(selectedRole);
    console.log("Role manually selected:", selectedRole);

    const addressToUse = googleAddress || extensionAddress;
    if (!addressToUse) {
        console.error("No wallet address found, cannot proceed");
        return;
    }
    const txb = new Transaction();
    
    
    if (selectedRole === 'freelancer') {
    txb.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::add_freelancer`,
        arguments: [
            txb.pure.address(addressToUse!),
        ],
    });
    console.log("Transaction block created for adding a freelancer.");
} else if (selectedRole === 'buyer') {
    txb.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::add_buyer`,
        arguments: [
            txb.pure.address(addressToUse!),
        ],
    });
    console.log("Transaction block created for adding a buyer.");
} else {
    console.error("Invalid role selected.");
    return;
}

try {
    const result = await wallet.signAndExecuteTransaction({
        transaction: txb,
    });

    console.log("Transaction executed successfully:", result);
} catch (error) {
    console.error("Transaction failed:", error);
}
  };

  if ((wallet.connected && roleChecked && isLoading) || (googleAddress && !role && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <h2>Checking for your role on the blockchain...</h2>
      </div>
    );
  }

  if ((wallet.connected && roleChecked && !role) || (googleAddress && zkLoginRoleChecked && !role)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-4xl font-bold mb-8 text-center">I am a...</h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
          <button onClick={() => handleRoleSelection('buyer')}>Buyer</button>
          <button onClick={() => handleRoleSelection('freelancer')}>Freelancer</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Welcome to Sui Zklogin</h1>

      <ConnectButton 
        className='btn'
        label="🔐 Start Ewallet Login"
        style={{ color: '#f0f0f0', backgroundColor: '#1A1A1A', padding: '0.6em 1.2em', borderRadius: 8 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={loginWithGoogle} className = 'google-btn'>🌐 Start Google Login</button>
        {setupData && (
          <div style={{ marginTop: 12 }}>
            <p>Key and nonce generated. Now sign in with Google.</p>
            <GoogleJwtLogin onSuccess={handleJwt} setupData={setupData} />
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Extension Wallet Address:</strong>
        <div>{extensionAddress ?? 'Not connected'}</div>
        <button onClick={handleCheckRole} disabled={!extensionAddress} style={{ marginTop: 8 }}>
          Check my role (on-chain)
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Google zkLogin Wallet Address:</strong>
        <div>{googleAddress ?? 'Not available'}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Raw wallet.account.address (from useWallet()):</strong>
        <div>{wallet.account?.address ?? '—'}</div>
      </div>
    </>
  );
}

export default App;

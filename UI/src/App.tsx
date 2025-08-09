import React, { useState, useEffect } from 'react';
import { AdminPage } from './pages/AdminPage';
import { FreelancerPage } from './pages/FreelancerPage';
import { BuyerPage } from './pages/BuyerPage';
import { LoginPage } from './pages/LoginPage';
import { UserRole } from './types';
import { detectUserRole } from './utils/roleDetection';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { createZkLoginSetup, type ZkLoginSetup } from '../../zklogin/src/lib/ephemeralKey';
import { useWallet } from "@suiet/wallet-kit";
import { generateProof } from '../../zklogin/src/lib/auth/createZkProof';
import { Transaction} from '@mysten/sui/transactions';
import { GoogleJwtLogin } from '../../zklogin/src/lib/auth/generateJWT';
import { getExtendedEphemeralPublicKey } from '@mysten/sui/zklogin';
import { getZkLoginSignature, genAddressSeed } from '@mysten/sui/zklogin';
//import { toBase64Url } from '../../zklogin/src/lib/auth/createZkProof';


const client = new SuiClient({ url: 'https://fullnode.devnet.sui.io'});
const PACKAGE_ID = '0x3bcb920bef49d3921c412d90053403d6335e54466322b6a0c6dfea8dd2c175e1';
const MODULE_NAME = "marketplace";

function toBase64Url(array) {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const fetchCaps = (address: string) => {
  return new Promise<string | null>((resolve) => {
    const check = async() => {
      const freelancerCapType = `${PACKAGE_ID}::${MODULE_NAME}::FreelancerCap`;
      const buyerCapType = `${PACKAGE_ID}::${MODULE_NAME}::BuyerCap`;
      console.log("Fetching cap");

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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [setupData, setSetupData] = useState<ZkLoginSetup | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [jwtHeader, setJwtHeader] = useState<string | null>(null);
  const [suiAddress, setSuiAddress] = useState<string | null>(null);

  const wallet = useWallet();
  const [extensionAddress, setExtensionAddress] = useState<string | null>(null);
  const [googleAddress, setGoogleAddress ] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState<boolean>(false);
  const [zkLoginRoleChecked, setZkLoginRoleChecked] = useState<boolean>(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [proofPoints, setProofPoints] = useState(null);
  const [decodedPayload, setDecodedPayload] = useState(null);
  const [salt, setSalt] = useState(null);
  const [proofMaxEpoch, setProofMaxEpoch] = useState<number | null>(null);
  const [proofBundle, setProofBundle] = useState(null);


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
    const checkWalletConnection = async () => {
      try {
        const savedAddress = localStorage.getItem('userAddress');
        if (savedAddress) {
          setUserAddress(savedAddress);
          const role = await fetchCaps(savedAddress);
          setUserRole(role as UserRole);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();
  }, []);

  useEffect(() => {
    console.log('wallet changed:', {
      connected: wallet.connected,
      account: wallet.account,
    });
    setExtensionAddress(wallet.account?.address ?? null);
  }, [wallet.connected, wallet.account]);

  const handleLogin = async (address: string) => {
    setRoleChecked(true);
    setZkLoginRoleChecked(false);
    if (!extensionAddress) {
      setUserRole(null);
      return;
    }
    setIsLoading(true);
    try {
      const role = await fetchCaps(address);
      setUserAddress(address);
      setUserRole(role as UserRole);
      console.log("The userRole is:",userRole);
      setIsLoading(false);
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

    const loginWithGoogle = async () => {
    setRoleChecked(false);
    setIsGoogleConnecting(true);
    try {
      const data = await createZkLoginSetup();
      setSetupData(data);
      console.log("Ephemeral key and nonce generated:", data);
    } catch (error) {
      console.error("Failed to set up zkLogin:", error);
    } finally {
      setIsGoogleConnecting(false);
    }
  };

  const handleJwt = async (jwtStr: string) => {
    console.log("JWT received:", jwtStr);
    setJwt(jwtStr);
    
    const [headerPart] = jwtStr.split('.');
    setJwtHeader(headerPart);
    setIsLoading(true);

    if (!setupData) {
      console.error("No setupData found. Did you run loginWithGoogle first?");
      setIsLoading(false);
      return;
    }
    if (setupData) {
      try {
        const usedEpoch = setupData.maxEpoch;
        setProofMaxEpoch(usedEpoch);
        const { proofPoints, userSuiAddress, salt, decodedPayload } = await generateProof(jwtStr, setupData);
        console.log("ProofPoints,userSuiAddress,salt,decodedPayload:",proofPoints, userSuiAddress, salt, decodedPayload );
        console.log("decodedPayload.iss from JWT:", decodedPayload.iss);
        
        if (!proofPoints?.a || !proofPoints?.b || !proofPoints?.c) {
          throw new Error("Invalid proofPoints format — missing a, b, or c.");
        }

        setProofPoints(proofPoints);
        setDecodedPayload(decodedPayload);
        setSalt(salt);
        setSuiAddress(userSuiAddress);
        setGoogleAddress(userSuiAddress);

        console.log("Sui Address (zkLogin):", userSuiAddress);
        console.log("ZkProof received:", proofPoints);
        console.log("Calling out the requestFaucetCoins");
        const first_time = await fetchCaps(userSuiAddress);
        setUserRole(first_time as UserRole);
        setZkLoginRoleChecked(true);
        console.log("This is the first time:",first_time);

        if (first_time === null) {
          await requestFaucetCoins(userSuiAddress);
          setUserAddress(userSuiAddress);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Failed to generate proof or get Sui address:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

const handleRoleSelection = async (selectedRole: string) => {
  setUserRole(selectedRole as UserRole);
  console.log("Role manually selected:", selectedRole);

  const addressToUse = googleAddress || extensionAddress;
  if (!addressToUse) {
    console.error("No wallet address found, cannot proceed");
    return;
  }

  if (!proofMaxEpoch) {
    console.error("No proofMaxEpoch saved — cannot sign safely.");
    return;
  }

  if (!proofPoints || !proofPoints.a || !proofPoints.b || !proofPoints.c) {
    console.error("ProofPoints missing — cannot proceed with zkLogin transaction.");
    return;
  }

  if (googleAddress) {
    if (!proofPoints || !salt || !decodedPayload) {
      console.error("Missing proof data — complete Google login first.");
      return;
    }
  }

  const txb = new Transaction();

  if (selectedRole === 'freelancer') {
    console.log("Transfering the freelancer cap");
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_freelancer`,
      arguments: [txb.pure.address(addressToUse)],
    });
  } else if (selectedRole === 'buyer') {
    console.log("Transfering the buyer cap");
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_buyer`,
      arguments: [txb.pure.address(addressToUse)],
    });
  } else {
    console.error("Invalid role selected.");
    return;
  }

  // The 'aud' field in a JWT can sometimes be a string or an array.
  // We must handle both cases to ensure the `genAddressSeed` function receives the correct value.
  const aud = Array.isArray(decodedPayload.aud) ? decodedPayload.aud[0] : decodedPayload.aud;
  const iss = decodedPayload.iss;

  try {
    if (setupData?.ephemeralKeyPair && googleAddress) {
      console.log("Signing with ephemeral key for zkLogin...");

      txb.setSender(googleAddress);

      const { bytes, signature: userSignature } = await txb.sign({
        signer: setupData.ephemeralKeyPair,
        client,
      });
      

      console.log("Using claims for addressSeed:");
      console.log("   claimName:", "sub");
      console.log("   claimValue (sub):", decodedPayload.sub);
      console.log("   aud:", aud);
      console.log("   iss:", iss);

    // Correctly calling genAddressSeed with the claim name and the first aud value if it's an array.
    const addressSeed = genAddressSeed(
      BigInt(salt),
      'sub',
      decodedPayload.sub,
      aud,
    ).toString();

      if (setupData.maxEpoch !== proofMaxEpoch) {
        console.warn("setupData.maxEpoch changed since proof generation.", { setupEpoch: setupData.maxEpoch, proofEpoch: proofMaxEpoch });
        console.error("Epoch mismatch between proof and signing. Please re-run Google login to obtain a fresh proof.");
        return;
      }
      
      // === FIX APPLIED HERE ===
      // The previous code was double-encoding the 'iss' value.
      // This fix correctly converts the original 'iss' string to a URL-safe Base64 string.
      // We first convert the string to a Uint8Array and then to Base64url.
      const textEncoder = new TextEncoder();
      const issBase64Url = toBase64Url(textEncoder.encode(decodedPayload.iss));
      const indexMod4 = issBase64Url.length % 4;

      
      const bundle = {
      proofPoints,           
      headerBase64: jwtHeader,      
      issBase64Details: {
        value: issBase64Url,
        indexMod4,
      },
      addressSeed,
      salt,
      decodedPayload,
      maxEpoch: setupData.maxEpoch,
      ephemeralPubkey: setupData.ephemeralKeyPair.getPublicKey().toBase64(),
      };

      setProofBundle(bundle);

      if (!jwtHeader) throw new Error("Missing jwtHeader in state");

      

      console.log("=== ZKLogin debug ===");
      console.log("Ephemeral keyL", setupData.ephemeralKeyPair);
      console.log("proofPoints:", proofPoints);
      console.log("decodedPayload.iss:", decodedPayload.iss);
      console.log("issBase64Url:", issBase64Url);
      console.log("indexMod4(url-safe):", indexMod4);
      console.log("jwtHeader (first segment):", jwtHeader);
      console.log("addressSeed:", addressSeed);
      console.log("salt (string):", salt);
      console.log("setupData.maxEpoch:", setupData.maxEpoch);
      console.log("userSignature (len):", (userSignature as any)?.length ?? typeof userSignature, userSignature);
  
      const zkLoginSignature = getZkLoginSignature({
        inputs: {
        proofPoints: {
          a: proofPoints.a,
          b: proofPoints.b,
          c: proofPoints.c,
        },
        issBase64Details: {
          // The value here MUST be the URL-safe base64 string
          value: issBase64Url,
          // The indexMod4 must be calculated based on the length of the URL-safe string
          indexMod4,
        },
        headerBase64: jwtHeader, // From your JWT's first segment
        addressSeed,
        },
        maxEpoch: proofMaxEpoch,
        userSignature: userSignature, // from txb.sign(...)
      });

      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
        options: { showEffects: true },
      });

      console.log("Transaction executed successfully (zkLogin):", result);
    }

      // Re-fetch caps to confirm role
      const newRole = await fetchCaps(addressToUse);
      setUserRole(newRole as UserRole);
      console.log("Updated role after mint:", newRole);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleLogout = () => {
    wallet.disconnect();
    setUserAddress(null);
    setUserRole(null);
    localStorage.removeItem('userAddress');
    console.log("Loging out");
};

  if (isLoading) {
    return (
      <div 
        className="min-h-screen font-['Inter'] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0d2e 25%, #2d1b4e 50%, #1a0d2e 75%, #0a0a0f 100%)',
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    );
  } 

  if (userRole) {
    switch (userRole) {
      case 'admin':
        return <AdminPage userAddress={userAddress!} onLogout={handleLogout} />;
      case 'freelancer':
        return <FreelancerPage userAddress={userAddress!} onLogout={handleLogout} />;
      case 'buyer':
        return <BuyerPage userAddress={userAddress!} onLogout={handleLogout} />;
    }
  }

  if (userAddress) {
    return <LoginPage userAddress={userAddress} onRoleSelection={handleRoleSelection} onLogin={handleLogin} onGoogleLogin={loginWithGoogle} isGoogleConnecting={isGoogleConnecting} handleJwt={handleJwt} setupData={setupData} />;
  }

  if (!userAddress || !userRole) {
    return <LoginPage onLogin={handleLogin} onGoogleLogin={loginWithGoogle} isGoogleConnecting={isGoogleConnecting} handleJwt={handleJwt} setupData={setupData} />;
  }

  if (userAddress && userRole === null) {
  return (
    <LoginPage
      userAddress={userAddress}
      onRoleSelection={handleRoleSelection}   // <-- allow GlassCard clicks
      onLogin={handleLogin}
      onGoogleLogin={loginWithGoogle}
      isGoogleConnecting={isGoogleConnecting}
      handleJwt={handleJwt}
      setupData={setupData}
    />
  );
}

  const renderPage = () => {
    switch (userRole) {
      case 'admin':
        return <AdminPage userAddress={userAddress} onLogout={handleLogout} />;
      case 'freelancer':
        return <FreelancerPage userAddress={userAddress} onLogout={handleLogout} />;
      case 'buyer':
        return <BuyerPage userAddress={userAddress} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} onGoogleLogin={loginWithGoogle} isGoogleConnecting={isGoogleConnecting} handleJwt={handleJwt} setupData={setupData}  />;
    }
  };

  return renderPage();
}

export default App;

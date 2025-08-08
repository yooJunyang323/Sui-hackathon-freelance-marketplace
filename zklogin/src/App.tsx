// src/App.tsx
import React, { useState } from 'react';
import { createZkLoginSetup, type ZkLoginSetup } from './lib/ephemeralKey'; // Import the new function
import { GoogleJwtLogin } from './lib/auth/generateJWT'; 
import './App.css';
import { generateProof } from './lib/auth/createZkProof';
import { ConnectButton } from "@suiet/wallet-kit";
import { useWallet } from "@suiet/wallet-kit";


function App() {
  const [setupData, setSetupData] = useState<ZkLoginSetup | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [suiAddress, setSuiAddress] = useState<string | null>(null);
  const wallet = useWallet();



  const connectWallet = async () => {
    ///
  };

  const loginWithGoogle = async () => {
    try {
      const data = await createZkLoginSetup();
      setSetupData(data);
      console.log("Ephemeral key and nonce generated:", data);

    } catch (error) {
      console.error("Failed to set up zkLogin:", error);
    }
  };

  const handleJwt = async (jwt: string) => {
    console.log("JWT received:", jwt);
    setJwt(jwt);
  
    if (setupData) {
      try {
        const { proofPoints, userSuiAddress, salt, decodedPayload } = await generateProof(jwt, setupData);
        setSuiAddress(userSuiAddress);
        console.log("Sui Address:", userSuiAddress);
         console.log("ZkProof received:", proofPoints);
      } catch (error) {
        console.error("Failed to generate proof or get Sui address:", error);
      }
    }
  
  
  };

  return (
    <>
    <h1>Welcome to Sui Zklogin</h1>

    <ConnectButton 
      className='btn'
      label="🔐 Start Ewallet Login"
      style={{  
        color: 'rgb(240, 240, 240)', 
        backgroundColor: '#1A1A1A', 
        padding: '0.6em 1.2em',
        borderRadius: '8px',
        border: '1px solid transparent',
        fontSize: '1em',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
        transition: 'border-color 0.25s',
      }}/>
    
    
    <button className="google-btn" onClick={loginWithGoogle}>
      🌐 Start Google Login
    </button>
    
    {setupData && (
      <div style={{ marginTop: '20px' }}>
        <p>Key and nonce generated. Now sign in with Google.</p>
        <GoogleJwtLogin onSuccess={handleJwt} setupData = {setupData} />
      </div>
    )}

    {jwt && (
      <div style={{ marginTop: '20px' }}>
        <p>JWT received!</p>
      </div>
    )}

    
    {wallet.connected && wallet.account && (
        <div style={{ marginTop: '20px' }}>
            <p>Wallet connected!</p>
            <p>Wallet Address: {wallet.account.address}</p>
        </div>
    )}
    </>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { AdminPage } from './pages/AdminPage';
import { FreelancerPage } from './pages/FreelancerPage';
import { BuyerPage } from './pages/BuyerPage';
import { LoginPage } from './pages/LoginPage';
import { UserRole } from './types';
import { detectUserRole } from './utils/roleDetection';

function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing wallet connection
    const checkWalletConnection = async () => {
      try {
        // In real implementation, check if wallet is already connected
        const savedAddress = localStorage.getItem('userAddress');
        if (savedAddress) {
          setUserAddress(savedAddress);
          const role = await detectUserRole(savedAddress);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();
  }, []);

  const handleLogin = async (address: string) => {
    setIsLoading(true);
    try {
      const role = await detectUserRole(address);
      setUserAddress(address);
      setUserRole(role);
      localStorage.setItem('userAddress', address);
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUserAddress(null);
    setUserRole(null);
    localStorage.removeItem('userAddress');
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

  if (!userAddress || !userRole) {
    return <LoginPage onLogin={handleLogin} />;
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
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return renderPage();
}

export default App;

import React, { useState } from 'react';
import { Wallet, Shield, Palette, ShoppingBag } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';

interface LoginPageProps {
  onLogin: (address: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection - replace with actual Sui wallet integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock addresses for demo - replace with actual wallet connection
      const mockAddresses = [
        '0xadmin123...', // Has AdminCap
        '0xfreelancer456...', // Has FreelancerCap  
        '0xbuyer789...' // Has BuyerCap
      ];
      
      const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      onLogin(randomAddress);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-['Inter'] relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0d2e 25%, #2d1b4e 50%, #1a0d2e 75%, #0a0a0f 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Futuristic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent mb-4">
              Sui Hire
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-purple-200/80 mb-8">
              Decentralized freelance marketplace on Sui blockchain
            </p>
          </div>

          {/* Connect Wallet Card */}
          <GlassCard className="p-8 mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Wallet className="w-8 h-8 text-purple-400" />
              <h2 className="text-2xl font-semibold text-white">Connect Your Wallet</h2>
            </div>
            <p className="text-purple-200/70 mb-8">
              Connect your Sui wallet to access the marketplace. Your role will be automatically detected based on your capabilities.
            </p>
            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-8 py-3 text-lg"
            >
              {isConnecting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </GlassCard>

          {/* Role Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Admin</h3>
              <p className="text-purple-200/70 text-sm">
                Manage marketplace, resolve disputes, and oversee operations
              </p>
              <div className="mt-4 text-xs text-purple-300/60">
                Requires: AdminCap
              </div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <Palette className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Freelancer</h3>
              <p className="text-purple-200/70 text-sm">
                List services, manage orders, and deliver quality work
              </p>
              <div className="mt-4 text-xs text-purple-300/60">
                Requires: FreelancerCap
              </div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <ShoppingBag className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Buyer</h3>
              <p className="text-purple-200/70 text-sm">
                Purchase services, manage orders, and review deliverables
              </p>
              <div className="mt-4 text-xs text-purple-300/60">
                Requires: BuyerCap
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

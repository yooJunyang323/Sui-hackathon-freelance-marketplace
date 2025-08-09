import React from 'react';
import { LogOut, User } from 'lucide-react';
import { AdminDashboard } from '../components/AdminDashboard';
import { Button } from '../components/Button';

interface AdminPageProps {
  userAddress: string;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ userAddress, onLogout }) => {
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
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl animate-pulse"></div>
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

      {/* Header */}
      <div className="relative z-10 border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                Sui Hire
              </h1>
              <div className="flex items-center space-x-2 text-purple-200/60">
                <User className="w-4 h-4" />
                <span className="text-sm">{userAddress.slice(0, 8)}...{userAddress.slice(-6)}</span>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
};

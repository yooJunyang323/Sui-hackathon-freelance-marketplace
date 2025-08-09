import React, { useState } from 'react';
import { Plus, Users, Shield, AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Table } from './Table';
import { callSmartContract } from '../utils/smartContract';
import { DisputedOrder } from '../types';

export const AdminDashboard: React.FC = () => {
  const [coinType, setCoinType] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userRole, setUserRole] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock disputed orders data
  const disputedOrders: DisputedOrder[] = [
    {
      id: '1',
      service_id: 'service_1',
      buyer_address: '0x1234...5678',
      freelancer_address: '0x9876...5432',
      payment_amount: 500,
      requirements_url: 'https://example.com/requirements',
      status: 'disputed',
      dispute_reason: 'Work not delivered on time',
      dispute_date: '2024-01-15',
      created_at: '2024-01-10',
      deadline: '2024-01-14'
    },
    {
      id: '2',
      service_id: 'service_2',
      buyer_address: '0xabcd...efgh',
      freelancer_address: '0xijkl...mnop',
      payment_amount: 750,
      requirements_url: 'https://example.com/requirements2',
      status: 'disputed',
      dispute_reason: 'Quality does not match requirements',
      dispute_date: '2024-01-16',
      created_at: '2024-01-12',
      deadline: '2024-01-15'
    }
  ];

  const handleCreateMarketplace = async () => {
    if (!coinType) return;
    setLoading(true);
    try {
      const result = await callSmartContract('create_marketplace', [coinType]);
      alert(result.message);
      setCoinType('');
    } catch (error) {
      alert('Error creating marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!userAddress || !userRole) return;
    setLoading(true);
    try {
      const result = await callSmartContract('add_user', [userAddress, userRole]);
      alert(result.message);
      setUserAddress('');
      setUserRole('');
    } catch (error) {
      alert('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminAddress) return;
    setLoading(true);
    try {
      const result = await callSmartContract('add_admin', [adminAddress]);
      alert(result.message);
      setAdminAddress('');
    } catch (error) {
      alert('Error adding admin');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (orderId: string) => {
    setLoading(true);
    try {
      const result = await callSmartContract('resolve_dispute', [orderId]);
      alert(result.message);
    } catch (error) {
      alert('Error resolving dispute');
    } finally {
      setLoading(false);
    }
  };

  const disputeColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'buyer_address', label: 'Buyer', render: (value: string) => `${value.slice(0, 8)}...` },
    { key: 'freelancer_address', label: 'Freelancer', render: (value: string) => `${value.slice(0, 8)}...` },
    { key: 'payment_amount', label: 'Amount', render: (value: number) => `${value} tokens` },
    { key: 'dispute_reason', label: 'Dispute Reason' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: DisputedOrder) => (
        <Button
          variant="success"
          onClick={() => handleResolveDispute(row.id)}
          disabled={loading}
          className="text-xs px-4 py-2"
        >
          Resolve
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard 👑</h1>
        <p className="text-white/70">Manage the marketplace and resolve disputes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Marketplace */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Create Marketplace</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Coin Type"
              value={coinType}
              onChange={setCoinType}
              placeholder="e.g., USDC, ETH"
              required
            />
            <Button
              onClick={handleCreateMarketplace}
              disabled={loading || !coinType}
              className="w-full"
            >
              Create Marketplace
            </Button>
          </div>
        </GlassCard>

        {/* Add User */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Add User</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="User Address"
              value={userAddress}
              onChange={setUserAddress}
              placeholder="0x..."
              required
            />
            <Select
              label="User Role"
              value={userRole}
              onChange={setUserRole}
              options={[
                { value: 'freelancer', label: 'Freelancer' },
                { value: 'buyer', label: 'Buyer' }
              ]}
              required
            />
            <Button
              onClick={handleAddUser}
              disabled={loading || !userAddress || !userRole}
              className="w-full"
              variant="success"
            >
              Add User
            </Button>
          </div>
        </GlassCard>

        {/* Add Admin */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Add Admin</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Admin Address"
              value={adminAddress}
              onChange={setAdminAddress}
              placeholder="0x..."
              required
            />
            <Button
              onClick={handleAddAdmin}
              disabled={loading || !adminAddress}
              className="w-full"
              variant="secondary"
            >
              Add Admin
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Handle Disputes */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-semibold text-white">Handle Disputes</h2>
        </div>
        <Table
          columns={disputeColumns}
          data={disputedOrders}
          emptyMessage="No disputed orders at the moment"
        />
      </div>
    </div>
  );
};

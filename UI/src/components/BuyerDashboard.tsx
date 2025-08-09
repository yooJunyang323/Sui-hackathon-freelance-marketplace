import React, { useState } from 'react';
import { ShoppingCart, Package, Clock, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Table } from './Table';
import { callSmartContract } from '../utils/smartContract';
import { Service, Order } from '../types';

export const BuyerDashboard: React.FC = () => {
  const [selectedService, setSelectedService] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [requirementsUrl, setRequirementsUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data
  const availableServices: Service[] = [
    {
      id: '1',
      name: 'React Web Development',
      price: 500,
      description: 'Full-stack React application development',
      delivery_time: 7,
      freelancer_address: '0x1234...5678',
      is_active: true
    },
    {
      id: '2',
      name: 'Smart Contract Audit',
      price: 1000,
      description: 'Comprehensive smart contract security audit',
      delivery_time: 14,
      freelancer_address: '0x9876...5432',
      is_active: true
    },
    {
      id: '3',
      name: 'UI/UX Design',
      price: 750,
      description: 'Modern and responsive UI/UX design',
      delivery_time: 10,
      freelancer_address: '0xabcd...efgh',
      is_active: true
    }
  ];

  const deliveredOrders: Order[] = [
    {
      id: '1',
      service_id: '1',
      buyer_address: '0xbuyer...1234',
      freelancer_address: '0x1234...5678',
      payment_amount: 500,
      requirements_url: 'https://example.com/requirements',
      status: 'delivered',
      github_url: 'https://github.com/freelancer/project',
      commit_hash: 'abc123def456',
      created_at: '2024-01-10',
      deadline: '2024-01-17'
    }
  ];

  const inProgressOrders: Order[] = [
    {
      id: '2',
      service_id: '2',
      buyer_address: '0xbuyer...1234',
      freelancer_address: '0x9876...5432',
      payment_amount: 1000,
      requirements_url: 'https://example.com/requirements2',
      status: 'in_progress',
      created_at: '2024-01-12',
      deadline: '2024-01-20'
    }
  ];

  const handlePurchaseService = async () => {
    if (!selectedService || !paymentAmount || !requirementsUrl) return;
    setLoading(true);
    try {
      const result = await callSmartContract('purchase_service', [
        selectedService, 
        parseFloat(paymentAmount), 
        requirementsUrl
      ]);
      alert(result.message);
      setSelectedService('');
      setPaymentAmount('');
      setRequirementsUrl('');
    } catch (error) {
      alert('Error purchasing service');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    setLoading(true);
    try {
      const result = await callSmartContract('accept_delivery', [orderId]);
      alert(result.message);
    } catch (error) {
      alert('Error accepting delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDelivery = async (orderId: string) => {
    setLoading(true);
    try {
      const result = await callSmartContract('reject_delivery', [orderId]);
      alert(result.message);
    } catch (error) {
      alert('Error rejecting delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendDeadline = async (orderId: string) => {
    setLoading(true);
    try {
      const result = await callSmartContract('extend_deadline', [orderId]);
      alert(result.message);
    } catch (error) {
      alert('Error extending deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeOrders = async () => {
    setLoading(true);
    try {
      const result = await callSmartContract('finalize_order_after_timeout', []);
      alert(result.message);
    } catch (error) {
      alert('Error finalizing orders');
    } finally {
      setLoading(false);
    }
  };

  const deliveredColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'freelancer_address', label: 'Freelancer', render: (value: string) => `${value.slice(0, 8)}...` },
    { key: 'payment_amount', label: 'Amount', render: (value: number) => `${value} tokens` },
    { key: 'github_url', label: 'GitHub', render: (value: string) => (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        View Code
      </a>
    )},
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: Order) => (
        <div className="flex space-x-2">
          <Button
            variant="success"
            onClick={() => handleAcceptDelivery(row.id)}
            disabled={loading}
            className="text-xs px-3 py-1"
          >
            Accept
          </Button>
          <Button
            variant="danger"
            onClick={() => handleRejectDelivery(row.id)}
            disabled={loading}
            className="text-xs px-3 py-1"
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  const inProgressColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'freelancer_address', label: 'Freelancer', render: (value: string) => `${value.slice(0, 8)}...` },
    { key: 'payment_amount', label: 'Amount', render: (value: number) => `${value} tokens` },
    { key: 'deadline', label: 'Deadline' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: Order) => {
        const isPastDeadline = new Date(row.deadline || '') < new Date();
        return isPastDeadline ? (
          <Button
            variant="secondary"
            onClick={() => handleExtendDeadline(row.id)}
            disabled={loading}
            className="text-xs px-3 py-1"
          >
            Extend Deadline
          </Button>
        ) : (
          <span className="text-white/60 text-xs">In Progress</span>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Buyer Dashboard 🛍️</h1>
        <p className="text-white/70">Purchase services and manage your orders</p>
      </div>

      {/* Purchase Service */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingCart className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-semibold text-white">Purchase Service</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Select Service"
            value={selectedService}
            onChange={setSelectedService}
            options={availableServices.map(service => ({
              value: service.id,
              label: `${service.name} - ${service.price} tokens`
            }))}
            required
          />
          <Input
            label="Payment Amount"
            type="number"
            value={paymentAmount}
            onChange={setPaymentAmount}
            placeholder="500"
            required
          />
          <Input
            label="Requirements URL"
            value={requirementsUrl}
            onChange={setRequirementsUrl}
            placeholder="https://example.com/requirements"
            required
          />
        </div>
        <div className="mt-4">
          <Button
            onClick={handlePurchaseService}
            disabled={loading || !selectedService || !paymentAmount || !requirementsUrl}
            className="w-full md:w-auto"
          >
            Purchase Service
          </Button>
        </div>
      </GlassCard>

      {/* Available Services */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Package className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-semibold text-white">Available Services</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableServices.map((service) => (
            <GlassCard key={service.id} className="p-6" hover>
              <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
              <p className="text-white/70 text-sm mb-4">{service.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-400 font-semibold">{service.price} tokens</span>
                <span className="text-white/60 text-sm">{service.delivery_time} days</span>
              </div>
              <p className="text-white/50 text-xs">
                By: {service.freelancer_address.slice(0, 8)}...
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Review Deliverables */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <CheckCircle className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold text-white">Review Deliverables</h2>
        </div>
        <Table
          columns={deliveredColumns}
          data={deliveredOrders}
          emptyMessage="No deliverables to review"
        />
      </div>

      {/* Extend Deadline */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-semibold text-white">In Progress Orders</h2>
        </div>
        <Table
          columns={inProgressColumns}
          data={inProgressOrders}
          emptyMessage="No orders in progress"
        />
      </div>

      {/* Finalize Orders */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Finalize Orders</h3>
            <p className="text-white/70 text-sm">
              Automatically finalize delivered orders where the grace period has expired
            </p>
          </div>
          <Button
            onClick={handleFinalizeOrders}
            disabled={loading}
            variant="secondary"
          >
            Finalize Orders
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

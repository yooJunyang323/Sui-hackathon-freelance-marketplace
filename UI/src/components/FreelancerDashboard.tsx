import React, { useState } from 'react';
import { Plus, Package, Clock, Truck } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Input } from './Input';
import { Table } from './Table';
import { callSmartContract } from '../utils/smartContract';
import { Service, Order } from '../types';

import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const keypair = Ed25519Keypair.generate();

export const FreelancerDashboard: React.FC = () => {
  const [freelancerCapId, setFreelancerCapId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [loading, setLoading] = useState(false);

  // === NEW STATE FOR PLACEHOLDER IDS ===
  const [listedServiceId, setListedServiceId] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [inProgressOrderId, setInProgressOrderId] = useState('');
  
  // Mock data with a placeholder service ID and order IDs
  // In a real app, this data would be fetched from the blockchain
  const userServices: Service[] = [
    {
      id: '0x174ce3e5ee7e13d0d4fbb11fa86478cf35072fce60ff813e0b2ab56132cc3472',
      name: 'React Web Development',
      price: 500,
      description: 'Full-stack React application development',
      delivery_time: 7,
      freelancer_address: '0x1234...5678',
      is_active: true
    },
  ];

  // Mock data for a freelancer's orders.
  // In a real application, this data would be fetched from the blockchain
  // filtering by the freelancer's address.
  const [pendingOrders, setPendingOrders] = useState<Order[]>([
    {
      id: '0xf78cfb336946aa327ea141a4eb1534a4d050f85b0e23071fee6c430925cc3ced',
      service_id: '0x174ce3e5ee7e13d0d4fbb11fa86478cf35072fce60ff813e0b2ab56132cc3472',
      buyer_address: '0xbuyer...1234',
      freelancer_address: '0xfreelancer...5678',
      payment_amount: 500,
      requirements_url: 'https://example.com/buyer-reqs',
      status: 'pending',
      created_at: '2024-01-15'
    }
  ]);

  const inProgressOrders: Order[] = [
    {
      id: '0xijklm67890...',
      service_id: '0x174ce3e5ee7e13d0d4fbb11fa86478cf35072fce60ff813e0b2ab56132cc3472',
      buyer_address: '0xijkl...mnop',
      freelancer_address: '0x1234...5678',
      payment_amount: 1000,
      requirements_url: 'https://example.com/requirements2',
      status: 'in_progress',
      created_at: '2024-01-10',
      deadline: '2024-01-24'
    }
  ];

  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [rejectedOrders, setRejectedOrders] = useState<Order[]>([]);

  const handleListService = async () => {
    if (!freelancerCapId || !serviceName || !servicePrice || !serviceDescription || !deliverables || !deliveryTime) {
      alert('Please fill out all fields and provide your Freelancer Capability ID.');
      return;
    }

    setLoading(true);
    try {
      const parsedPrice = parseFloat(servicePrice);
      const parsedDeliveryTime = parseInt(deliveryTime);

      // In a real application, the response object from `callSmartContract`
      // would contain the new service ID. For now, we'll use a placeholder.
      const response = await callSmartContract(
        'list_service',
        '',
        [freelancerCapId, serviceName, serviceDescription, parsedPrice, deliverables, parsedDeliveryTime]
      );

      if (response.success) {
        // Here you would get the new serviceId from the response.
        // For now, we'll use a placeholder from your example.
        const newServiceId = '0x174ce3e5ee7e13d0d4fbb11fa86478cf35072fce60ff813e0b2ab56132cc3472';
        setListedServiceId(newServiceId);
        
        alert('Service listed successfully! The generated ID is: ' + newServiceId);
        // Clear the form on success
        setServiceName('');
        setServicePrice('');
        setServiceDescription('');
        setDeliveryTime('');
        setDeliverables('');
      } else {
        alert('Transaction failed: ' + response.message);
      }
    } catch (error) {
      console.error('Error listing service:', error);
      alert('Error listing service');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawService = async (serviceId: string) => {
    setLoading(true);
    try {
      if (!freelancerCapId) {
        alert('Please enter your Freelancer Capability ID to withdraw a service.');
        return;
      }
      const result = await callSmartContract('withdraw_service', '', [freelancerCapId, serviceId]);
      if (result.success) {
        alert(result.message);
        // You would typically refetch the list of services here
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error withdrawing service');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setLoading(true);
    try {
      // Simulate a call to the smart contract
      const result = await callSmartContract('accept_order', orderId);
      if (result.success) {
        // Move the accepted order from pending to active
        const acceptedOrder = pendingOrders.find(order => order.id === orderId);
        if (acceptedOrder) {
          const updatedPending = pendingOrders.filter(order => order.id !== orderId);
          setPendingOrders(updatedPending);
          setActiveOrders([...activeOrders, { ...acceptedOrder, status: 'in_progress' }]);
          console.log(`Order ${orderId.slice(0, 8)}... accepted successfully!`);
        }
      } else {
        console.error('Error accepting order:', result.message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setLoading(true);
    try {
      // Simulate a call to the smart contract
      const result = await callSmartContract('reject_order', orderId);
      if (result.success) {
        // The order is simply removed from the pending list
        const updatedPending = pendingOrders.filter(order => order.id !== orderId);
        setPendingOrders(updatedPending);
        console.log(`Order ${orderId.slice(0, 8)}... rejected and terminated.`);
      } else {
        console.error('Error rejecting order:', result.message);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverWork = async (orderId: string) => {
    if (!githubUrl || !commitHash) return;
    setLoading(true);
    try {
      const result = await callSmartContract('deliver_work', [orderId, githubUrl, commitHash]);
      alert(result.message);
      setGithubUrl('');
      setCommitHash('');
    } catch (error) {
      alert('Error delivering work');
    } finally {
      setLoading(false);
    }
  };

  const serviceColumns = [
    { key: 'name', label: 'Service Name' },
    { key: 'price', label: 'Price', render: (value: number) => `${value} tokens` },
    { key: 'delivery_time', label: 'Delivery Time', render: (value: number) => `${value} days` },
    { key: 'is_active', label: 'Status', render: (value: boolean) => value ? 'Active' : 'Inactive' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: Service) => (
        <Button
          variant="danger"
          onClick={() => handleWithdrawService(row.id)}
          disabled={loading || !row.is_active}
          className="text-xs px-4 py-2"
        >
          Withdraw
        </Button>
      )
    }
  ];

  const pendingOrderColumns = [
    { key: 'id', label: 'Order ID' },
    { key: 'buyer_address', label: 'Buyer', render: (value: string) => `${value.slice(0, 8)}...` },
    { key: 'payment_amount', label: 'Amount', render: (value: number) => `${value} tokens` },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: Order) => (
        <div className="flex space-x-2">
          <Button
            variant="success"
            onClick={() => handleAcceptOrder(row.id)}
            disabled={loading}
            className="text-xs px-3 py-1"
          >
            Accept
          </Button>
          <Button
            variant="danger"
            onClick={() => handleRejectOrder(row.id)}
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
    { key: 'buyer_address', label: 'Buyer', render: (value: string) => `${value.slice(0, 8)}...` },
    { key: 'payment_amount', label: 'Amount', render: (value: number) => `${value} tokens` },
    { key: 'deadline', label: 'Deadline' },
    { 
      key: 'actions', 
      label: 'Deliver Work',
      render: (_: any, row: Order) => (
        <div className="space-y-2">
          <Input
            placeholder="GitHub URL"
            value={githubUrl}
            onChange={setGithubUrl}
            className="text-xs"
          />
          <Input
            placeholder="Commit Hash"
            value={commitHash}
            onChange={setCommitHash}
            className="text-xs"
          />
          <Button
            variant="success"
            onClick={() => handleDeliverWork(row.id)}
            disabled={loading || !githubUrl || !commitHash}
            className="text-xs px-3 py-1 w-full"
          >
            Deliver
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Freelancer Dashboard 🎨</h1>
        <p className="text-white/70">Manage your services and orders</p>
      </div>

      {/* Top Cards Row - Same as Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List a Service */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">List Service</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Service Name"
              value={serviceName}
              onChange={setServiceName}
              placeholder="e.g., Web Development"
              required
            />
            <Input
              label="Price (tokens)"
              type="number"
              value={servicePrice}
              onChange={setServicePrice}
              placeholder="500"
              required
            />
            <Input
              label="Delivery Time (days)"
              type="number"
              value={deliveryTime}
              onChange={setDeliveryTime}
              placeholder="7"
              required
            />
            <Button
              onClick={handleListService}
              disabled={loading || !serviceName || !servicePrice || !deliveryTime}
              className="w-full"
            >
              List Service
            </Button>
          </div>
        </GlassCard>

        {/* Service Description */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Service Details</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Description"
              value={serviceDescription}
              onChange={setServiceDescription}
              placeholder="Detailed description of your service..."
              required
            />
            <div className="text-sm text-purple-300/60 mt-4">
              <p>• Be specific about what you'll deliver</p>
              <p>• Include your expertise level</p>
              <p>• Mention any requirements</p>
            </div>
          </div>
        </GlassCard>

        {/* Delivery Management */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Truck className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Delivery Info</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="GitHub URL"
              value={githubUrl}
              onChange={setGithubUrl}
              placeholder="https://github.com/..."
            />
            <Input
              label="Commit Hash"
              value={commitHash}
              onChange={setCommitHash}
              placeholder="abc123..."
            />
            <div className="text-sm text-purple-300/60 mt-4">
              <p>• Use for work delivery</p>
              <p>• Ensure code is well documented</p>
              <p>• Include README instructions</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Your Services */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Package className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-semibold text-white">Your Services</h2>
        </div>
        <Table
          columns={serviceColumns}
          data={userServices}
          emptyMessage="You haven't listed any services yet"
        />
      </div>

      {/* Manage Orders */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-semibold text-white">Pending Orders</h2>
        </div>
        <Table
          columns={pendingOrderColumns}
          data={pendingOrders}
          emptyMessage="No pending orders"
        />
      </div>

      {/* Deliver Work */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Truck className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold text-white">In Progress Orders</h2>
        </div>
        <Table
          columns={inProgressColumns}
          data={inProgressOrders}
          emptyMessage="No orders in progress"
        />
      </div>
    </div>
  );
};

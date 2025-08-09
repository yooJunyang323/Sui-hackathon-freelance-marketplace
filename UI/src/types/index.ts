export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  delivery_time: number;
  freelancer_address: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  service_id: string;
  buyer_address: string;
  freelancer_address: string;
  payment_amount: number;
  requirements_url: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'disputed';
  github_url?: string;
  commit_hash?: string;
  created_at: string;
  deadline?: string;
}

export interface User {
  address: string;
  role: 'admin' | 'freelancer' | 'buyer';
  name?: string;
}

export interface DisputedOrder extends Order {
  dispute_reason: string;
  dispute_date: string;
}

export type UserRole = 'admin' | 'freelancer' | 'buyer';

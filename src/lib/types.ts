export type ProductType = 'digital' | 'service' | 'subscription';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price_cents: number;
  compare_price_cents: number | null;
  category: string;
  product_type: ProductType;
  tags: string;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number;
  preview_images: string;
  thumbnail_url: string | null;
  stripe_price_id: string | null;
  status: string;
  featured: number;
  preview_url: string | null;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paypal_order_id: string | null;
  payment_method: "stripe" | "paypal" | "crypto";
  customer_email: string;
  customer_name: string | null;
  customer_id: string | null;
  product_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  download_token: string | null;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  downloaded_at: string | null;
  created_at: string;
  refunded_at: string | null;
}

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  password_reset_token: string | null;
  password_reset_expires: string | null;
  total_spent_cents: number;
  order_count: number;
  first_purchase_at: string | null;
  last_purchase_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  lead_magnet: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  status: "active" | "unsubscribed";
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price_cents: number;
  quantity: number;
  created_at: string;
}

export interface Download {
  id: string;
  customer_id: string | null;
  product_id: string | null;
  order_id: string | null;
  downloaded_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface DashboardStats {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
  };
  dailyRevenue: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; revenue: number; sales: number }>;
  recentOrders: Array<Order & { product_name?: string }>;
  totalCustomers: number;
  totalSubscribers: number;
}

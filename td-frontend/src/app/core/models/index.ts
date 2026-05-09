export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  province?: string;
  city?: string;
  address?: string;
  reference?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
  productId: string;
}

export interface Promotion {
  id: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  promotions: Promotion[];
  originalPrice: number;
  finalPrice: number;
  discountPct: number;
  hasPromotion: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  product: Product;
  originalPrice: number;
  discountPct: number;
  finalPrice: number;
  lineTotal: number;
}

export interface Cart {
  cartId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  finalPrice: number;
  product: Product;
}

export interface Invoice {
  id: string;
  number: string;
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: string;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  tax: number;
  total: number;
  province?: string;
  city?: string;
  address?: string;
  reference?: string;
  createdAt: string;
  items: OrderItem[];
  invoice?: Invoice;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalSales: number;
  };
  outOfStockProducts: Product[];
  lowStockProducts: Product[];
  recentOrders: Order[];
}
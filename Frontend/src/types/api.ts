// Tipos alinhados com os DTOs do backend (com.cafeteria.api.application.dto)

export type UUID = string;

export type UserRole = 'USER' | 'ADMIN';

export interface UserResponse {
  id: UUID;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: UserResponse;
}

export interface CategoryResponse {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  displayOrder: number;
}

export interface ProductImageResponse {
  id: UUID;
  url: string;
  primary: boolean;
  displayOrder: number;
}

export interface ProductResponse {
  id: UUID;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: CategoryResponse;
  available: boolean;
  stock: number;
  images: ProductImageResponse[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CartItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: UUID;
  items: CartItemResponse[];
  total: number;
  itemCount: number;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';

export interface OrderItemResponse {
  id: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string | null;
}

export interface OrderResponse {
  id: UUID;
  userId: UUID;
  userName: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteResponse {
  id: UUID;
  product: ProductResponse;
  createdAt: string;
}

export interface ReviewResponse {
  id: UUID;
  userId: UUID;
  userName: string;
  productId: UUID;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface NotificationResponse {
  id: UUID;
  type: 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'GENERAL';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStatsResponse {
  totalRevenueMonth: number;
  totalRevenueLast7Days: number;
  totalOrders: number;
  revenueLast7Days: { day: string; revenue: number }[];
  topProducts: { productId: UUID; productName: string; quantity: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export interface UploadImageResponse {
  id: UUID;
  url: string;
  primary: boolean;
}

// Requests
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface CartItemRequest {
  productId: UUID;
  quantity: number;
}
export interface UpdateCartItemRequest {
  quantity: number;
}
export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  notes?: string;
}
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
export interface ReviewRequest {
  productId: UUID;
  rating: number;
  comment?: string;
}
export interface CategoryRequest {
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
}
export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: UUID;
  imageUrl?: string;
  available: boolean;
  stock: number;
}

// Problem Details RFC 7807
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  traceId?: string;
  errors?: { field: string; message: string }[];
}

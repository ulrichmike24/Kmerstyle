export type Language = 'fr' | 'en';
export type UserRole = 'customer' | 'admin' | 'delivery';
export type PortalType = 'client' | 'admin' | 'delivery';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
}

export type ProductCategory = 'men' | 'women' | 'shoes' | 'watches' | 'perfumes' | 'accessories';
export type ProductGender = 'men' | 'women' | 'unisex';

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
  priceOffset?: number;
}

export interface ProductReview {
  id: string;
  authorName: string;
  city: string; // e.g. Douala, Yaoundé
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedBuyer: boolean;
}

export interface Product {
  id: string;
  title: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  category: ProductCategory;
  subCategory: string;
  gender: ProductGender;
  price: number; // In XAF (FCFA)
  compareAtPrice?: number; // Previous price for strikethrough discount
  images: string[];
  rating: number;
  reviewCount: number;
  isFlashSale?: boolean;
  flashSaleDiscountPercent?: number;
  flashSaleEndsAt?: string; // ISO string
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  brand: string;
  fabricOrMaterial?: string;
  costPrice?: number; // Cost of goods for accounting and profit margin
  variants: ProductVariant[];
  reviews: ProductReview[];
  completeLookIds: string[];
}

export interface CartItem {
  cartItemId: string; // generated unique id: productId + variantId
  productId: string;
  variantId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface DeliveryZone {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  fee: number; // In XAF
  estimatedHours: {
    fr: string;
    en: string;
  };
  cities: string[];
}

export interface ShippingRate {
  id: string; // e.g. "yaounde", "douala"
  town: string; // "Yaoundé", "Douala", "Bafoussam", etc.
  region: string;
  fee: number; // In XAF
  deliveryTime: {
    fr: string;
    en: string;
  };
  freeShippingEligible?: boolean;
  minOrderForFreeShipping?: number;
  isActive: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percent or XAF
  minOrderValue: number; // in XAF
  maxDiscount?: number;
  description: {
    fr: string;
    en: string;
  };
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentMethod = 'momo' | 'om' | 'cod' | 'card';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface DeliveryAddress {
  city: string;
  quartier: string;
  landmark: string; // e.g. "En face de la pharmacie du Rond-point, portail noir"
  recipientName: string;
  phone: string; // +237 6XXXXXXXX
  backupPhone?: string;
  pinLocation?: {
    lat: number;
    lng: number;
    label?: string;
  };
}

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  note: {
    fr: string;
    en: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. KC-2025-8492
  customerId: string; // 'guest' or uid
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: DeliveryAddress;
  deliveryZoneId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedCouponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  paymentReference?: string;
  merchantCode?: string;
  transactionRef?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedAgentPhone?: string;
  deliveryProofImage?: string;
  clientSignature?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  pin: string; // 4-digit secret PIN generated and controlled by admin
  active: boolean;
  zone: string;
  vehicle: string;
  currentCashCollected: number; // in XAF
  completedDeliveriesCount: number;
  createdAt: string;
}

export type ExpenseCategory = 'delivery_fuel' | 'packaging' | 'marketing' | 'rent' | 'salaries' | 'utilities' | 'other';

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // in XAF
  date: string;
  recordedBy: string;
  notes?: string;
}

export type AuditCategory = 'auth' | 'order' | 'inventory' | 'finance' | 'delivery';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  category: AuditCategory;
  details: string;
  userOrAgent: string;
  severity?: 'info' | 'warning' | 'success';
}

export interface AdminSession {
  token: string;
  email: string;
  role: 'admin';
  authenticatedWith2FA: boolean;
  issuedAt: number;
  expiresAt: number;
}

export interface CourierSession {
  token: string;
  agentId: string;
  name: string;
  phone: string;
  role: 'delivery';
  issuedAt: number;
  expiresAt: number;
}

export type LoyaltyTier = 'bronze' | 'argent' | 'or' | 'platine';

export interface LoyaltyMember {
  id: string; // phone or unique id
  phone: string;
  name: string;
  email?: string;
  city?: string;
  points: number;
  tier: LoyaltyTier;
  totalSpent: number;
  ordersCount: number;
  joinedAt: string;
  updatedAt: string;
}

export type WhitelistVipLevel = 'vip' | 'ambassadeur' | 'direction' | 'partenaire';

export interface WhitelistEntry {
  id: string;
  phone: string;
  email?: string;
  name: string;
  vipLevel: WhitelistVipLevel;
  discountPercent: number; // e.g. 10
  freeDeliveryAllRegions: boolean;
  notes?: string;
  addedAt: string;
  isActive: boolean;
}

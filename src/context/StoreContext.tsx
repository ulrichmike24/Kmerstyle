import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Product,
  CartItem,
  ProductVariant,
  ProductReview,
  Order,
  OrderStatus,
  UserProfile,
  Language,
  ProductCategory,
  DeliveryZone,
  Coupon,
  UserRole,
  PortalType,
  DeliveryAgent,
  ExpenseItem,
  AuditLogItem,
  AuditCategory,
  AdminSession,
  CourierSession,
  ShippingRate,
  LoyaltyMember,
  LoyaltyTier,
  WhitelistEntry,
  WhitelistVipLevel,
} from '../types';
import { SEED_PRODUCTS, SEED_DELIVERY_ZONES, SEED_COUPONS } from '../data/seedData';
import { generateOrderNumber, formatXAF } from '../lib/formatters';
import { translations } from '../lib/i18n';
import {
  authenticateAdmin,
  authenticateCourier,
  verifyJwtToken,
  updateAdminCredentials,
  DEFAULT_MASTER_ADMIN,
} from '../services/auth/AuthService';

export interface PaymentNotification {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  city: string;
  merchantCode: string;
  timestamp: string;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  user: UserProfile;
  language: Language;
  t: typeof translations['fr'];
  deliveryZones: DeliveryZone[];
  shippingRates: ShippingRate[];
  calculateDeliveryFee: (townOrLocation: string, subtotal?: number) => number;
  getShippingRateForTown: (townOrLocation: string) => ShippingRate | undefined;
  updateShippingRate: (rate: ShippingRate) => Promise<void>;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  searchQuery: string;
  selectedCategory: ProductCategory | 'all';
  activeProductDetail: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  activeTrackingOrder: Order | null;
  isSizeGuideOpen: boolean;
  cartSubtotal: number;
  cartItemCount: number;
  discountAmount: number;
  freeShippingThreshold: number;

  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;

  // Security & Sessions
  adminSession: AdminSession | null;
  courierSession: CourierSession | null;
  couriers: DeliveryAgent[];
  expenses: ExpenseItem[];
  auditLogs: AuditLogItem[];

  // Real-time Payment Notifications
  newPaymentAlert: PaymentNotification | null;
  dismissPaymentAlert: () => void;

  // Merchant codes
  momoMerchantCode: string;
  omMerchantCode: string;
  updateMerchantCodes: (momo: string, om: string) => Promise<void>;

  // Actions
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city: string;
    quartier: string;
    landmark: string;
    deliveryFee: number;
    paymentMethod: 'om' | 'momo' | 'cod';
    merchantCode?: string;
    transactionRef?: string;
  }) => Promise<Order>;

  updateOrderStatus: (orderId: string, status: OrderStatus, noteFr?: string, noteEn?: string) => Promise<void>;
  assignOrderCourier: (orderId: string, courierId: string, courierName: string, courierPhone: string) => Promise<void>;
  completeDeliveryWithProof: (orderId: string, proofImageBase64: string, clientSignatureBase64: string) => Promise<void>;
  markOrderPaid: (orderId: string) => Promise<void>;

  setLanguage: (lang: Language) => void;
  setUserRole: (role: UserRole) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  setActiveProductDetail: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setActiveTrackingOrder: (order: Order | null) => void;
  setIsSizeGuideOpen: (open: boolean) => void;
  findOrder: (orderNumber: string) => Order | undefined;

  // Admin CRUD & Management
  addProduct: (newProduct: Product) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addProductReview: (
    productId: string,
    review: {
      authorName: string;
      city: string;
      rating: number;
      comment: string;
      verifiedBuyer?: boolean;
    }
  ) => Promise<void>;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  updateDeliveryZoneFee: (zoneId: string, fee: number) => void;

  // Loyalty & Whitelist VIP
  loyaltyMembers: LoyaltyMember[];
  whitelist: WhitelistEntry[];
  isLoyaltyModalOpen: boolean;
  setIsLoyaltyModalOpen: (open: boolean) => void;
  lookupLoyaltyMember: (phoneOrEmail: string) => LoyaltyMember | undefined;
  addOrUpdateLoyaltyPoints: (phone: string, name: string, pointsEarned: number, spentAmount: number) => Promise<LoyaltyMember>;
  redeemLoyaltyPoints: (phone: string, pointsToRedeem: number) => Promise<boolean>;
  checkWhitelist: (phoneOrEmail: string) => WhitelistEntry | undefined;
  addWhitelistEntry: (entry: WhitelistEntry) => Promise<void>;
  deleteWhitelistEntry: (entryId: string) => Promise<void>;

  // Auth, Couriers, Inventory, and Accounting operations
  adminLogin: (email: string, pass: string, totp: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  courierLogin: (phone: string, pin: string) => { success: boolean; error?: string };
  courierLogout: () => void;
  addCourier: (courier: DeliveryAgent) => Promise<void>;
  deleteCourier: (courierId: string) => Promise<void>;
  reconcileCourierCash: (courierId: string, amount: number, note?: string) => Promise<void>;
  addExpense: (expense: ExpenseItem) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  adjustStock: (productId: string, variantId: string, delta: number, reason: string) => Promise<void>;
  addAuditLog: (action: string, category: AuditCategory, details: string, userOrAgent?: string, severity?: 'info' | 'warning' | 'success') => Promise<void>;
  updateAdminAccount: (newEmail: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 50000; // 50 000 FCFA

export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  {
    id: 'yaounde',
    town: 'Yaoundé',
    region: 'Centre (Siège & Showroom Bastos)',
    fee: 1500,
    deliveryTime: { fr: 'Livraison express en 2h à 4h', en: 'Express delivery in 2h - 4h' },
    freeShippingEligible: true,
    minOrderForFreeShipping: 50000,
    isActive: true,
  },
  {
    id: 'douala',
    town: 'Douala',
    region: 'Littoral (Showroom Akwa & Bonapriso)',
    fee: 2500,
    deliveryTime: { fr: 'Livraison en 24h ouvrées', en: 'Delivery within 24 business hours' },
    freeShippingEligible: true,
    minOrderForFreeShipping: 50000,
    isActive: true,
  },
  {
    id: 'bafoussam',
    town: 'Bafoussam',
    region: 'Ouest (Hauts Plateaux)',
    fee: 3500,
    deliveryTime: { fr: 'Livraison sous 24h à 48h', en: 'Delivery within 24h - 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'kribi',
    town: 'Kribi',
    region: 'Sud (Bord de Mer & Port)',
    fee: 3500,
    deliveryTime: { fr: 'Livraison sous 48h', en: 'Delivery within 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'limbe-buea',
    town: 'Limbe / Buea',
    region: 'Sud-Ouest (Mont Cameroun & Côte)',
    fee: 3000,
    deliveryTime: { fr: 'Livraison sous 24h à 48h', en: 'Delivery within 24h - 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'bamenda',
    town: 'Bamenda',
    region: 'Nord-Ouest',
    fee: 4000,
    deliveryTime: { fr: 'Livraison sous 48h', en: 'Delivery within 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'garoua',
    town: 'Garoua',
    region: 'Nord (Bénoué)',
    fee: 5000,
    deliveryTime: { fr: 'Expédition agence 48h à 72h', en: 'Agency dispatch 48h - 72h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'maroua',
    town: 'Maroua',
    region: 'Extrême-Nord (Diamaré)',
    fee: 5000,
    deliveryTime: { fr: 'Expédition agence 48h à 72h', en: 'Agency dispatch 48h - 72h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'ngaoundere',
    town: 'Ngaoundéré',
    region: "Adamaoua (Château d'eau)",
    fee: 4500,
    deliveryTime: { fr: 'Expédition sous 48h', en: 'Dispatch within 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'bertoua',
    town: 'Bertoua',
    region: 'Est (Lom-et-Djérem)',
    fee: 4500,
    deliveryTime: { fr: 'Expédition sous 48h', en: 'Dispatch within 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'ebolowa',
    town: 'Ebolowa',
    region: 'Sud (Mvila)',
    fee: 3500,
    deliveryTime: { fr: 'Expédition sous 24h à 48h', en: 'Dispatch within 24h - 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'dschang',
    town: 'Dschang',
    region: 'Ouest (Menoua)',
    fee: 3500,
    deliveryTime: { fr: 'Livraison sous 24h à 48h', en: 'Delivery within 24h - 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'foumban',
    town: 'Foumban',
    region: 'Ouest (Noun & Cité Royale)',
    fee: 3500,
    deliveryTime: { fr: 'Livraison sous 48h', en: 'Delivery within 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
  {
    id: 'edea',
    town: 'Edéa',
    region: 'Littoral (Sanaga-Maritime)',
    fee: 3000,
    deliveryTime: { fr: 'Livraison sous 24h à 48h', en: 'Delivery within 24h - 48h' },
    freeShippingEligible: false,
    isActive: true,
  },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Language state (French default)
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kc_lang') as Language) || 'fr';
  });

  const t = useMemo(() => translations[language], [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kc_lang', lang);
  };

  // 2. User & Role state
  const [user, setUser] = useState<UserProfile>(() => {
    const savedRole = (localStorage.getItem('kc_role') as UserRole) || 'customer';
    return {
      uid: 'user-client',
      displayName: 'Client KamerChic',
      email: '',
      phone: '',
      role: savedRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };
  });

  const setUserRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    localStorage.setItem('kc_role', role);
  };

  // 2b. Portal state with URL Hash synchronization (#client, #admin, #delivery)
  const [activePortal, setActivePortalState] = useState<PortalType>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) return 'admin';
      if (hash.includes('delivery')) return 'delivery';
    }
    const saved = localStorage.getItem('kc_portal') as PortalType;
    return saved === 'admin' || saved === 'delivery' ? saved : 'client';
  });

  const setActivePortal = (portal: PortalType) => {
    setActivePortalState(portal);
    localStorage.setItem('kc_portal', portal);
    if (typeof window !== 'undefined') {
      window.location.hash = portal === 'client' ? '' : portal;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setActivePortalState('admin');
      } else if (hash.includes('delivery')) {
        setActivePortalState('delivery');
      } else {
        setActivePortalState('client');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2c. Security Sessions (JWT & 2FA protected)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem('kc_admin_session');
    if (saved) {
      try {
        const parsed: AdminSession = JSON.parse(saved);
        if (verifyJwtToken(parsed.token)) return parsed;
      } catch {}
    }
    return null;
  });

  const [courierSession, setCourierSession] = useState<CourierSession | null>(() => {
    const saved = localStorage.getItem('kc_courier_session');
    if (saved) {
      try {
        const parsed: CourierSession = JSON.parse(saved);
        if (verifyJwtToken(parsed.token)) return parsed;
      } catch {}
    }
    return null;
  });

  // 3. FIRESTORE REAL-TIME SYNCHRONIZED STATE (NO FICTIVE DATA!)
  // Products
  const [products, setProducts] = useState<Product[]>([]);
  // Real Orders (starts 100% empty, populated by real client checkout)
  const [orders, setOrders] = useState<Order[]>([]);
  // Couriers
  const [couriers, setCouriers] = useState<DeliveryAgent[]>([]);
  // Real Accounting Expenses (starts 100% empty, zero fake expenses!)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  // Audit Logs (starts 100% empty)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  // Dynamic Cameroon Shipping Rates from Firestore collection 'shipping_rates'
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(DEFAULT_SHIPPING_RATES);
  // Club Prestige Loyalty Members
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);
  // VIP Whitelist Clients
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  // Loyalty modal trigger
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);

  // Merchant Codes
  const [momoMerchantCode, setMomoMerchantCode] = useState('789012');
  const [omMerchantCode, setOmMerchantCode] = useState('654321');

  // Real-time Payment Notification Alert
  const [newPaymentAlert, setNewPaymentAlert] = useState<PaymentNotification | null>(null);
  const dismissPaymentAlert = () => setNewPaymentAlert(null);

  // Track initial load to avoid firing alerts on boot
  const isFirstOrdersLoad = useRef(true);

  // Play audio chime for new payment
  const playPaymentSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}
  };

  // -------------------------------------------------------------
  // FIRESTORE LISTENERS (REAL-TIME onSnapshot)
  // -------------------------------------------------------------

  // Products Listener
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        if (!snap.empty) {
          const list: Product[] = [];
          snap.forEach((d) => list.push(d.data() as Product));
          setProducts(list);
        } else {
          // Seed initial products once into Firestore so the boutique is populated with real catalog
          SEED_PRODUCTS.forEach(async (p) => {
            await setDoc(doc(db, 'products', p.id), p).catch(() => {});
          });
          setProducts(SEED_PRODUCTS);
        }
      },
      (err) => {
        console.warn('Firestore products listener fallback:', err);
        setProducts(SEED_PRODUCTS);
      }
    );
    return () => unsub();
  }, []);

  // Orders Listener (100% Real data)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const list: Order[] = [];
        snap.forEach((d) => list.push(d.data() as Order));

        // Sort descending by creation date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Check for new paid orders to trigger live notification
        if (!isFirstOrdersLoad.current && snap.docChanges) {
          snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newOrd = change.doc.data() as Order;
              if (newOrd.paymentStatus === 'paid') {
                playPaymentSound();
                setNewPaymentAlert({
                  id: newOrd.id,
                  orderNumber: newOrd.orderNumber,
                  customerName: newOrd.customerName,
                  amount: newOrd.total,
                  city: newOrd.deliveryAddress.city,
                  merchantCode: newOrd.merchantCode || '654321',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
              }
            }
          });
        }
        isFirstOrdersLoad.current = false;
        setOrders(list);
      },
      (err) => {
        console.warn('Firestore orders listener:', err);
      }
    );
    return () => unsub();
  }, []);

  // Couriers Listener
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'couriers'),
      (snap) => {
        if (!snap.empty) {
          const list: DeliveryAgent[] = [];
          snap.forEach((d) => list.push(d.data() as DeliveryAgent));
          setCouriers(list);
        } else {
          // Seed the two initial real delivery agents for Douala and Yaoundé
          const initialCouriers: DeliveryAgent[] = [
            {
              id: 'courier-douala-01',
              name: 'Jean-Paul Manga',
              phone: '+237 677 88 99 00',
              pin: '2025',
              active: true,
              zone: 'Douala (Akwa, Bonapriso, Bonanjo, Makepe)',
              vehicle: 'Moto Yamaha YBR 125',
              currentCashCollected: 0,
              completedDeliveriesCount: 0,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'courier-yaounde-01',
              name: 'Eric Tchuente',
              phone: '+237 699 11 22 33',
              pin: '1985',
              active: true,
              zone: 'Yaoundé (Bastos, Omnisports, Mendong, Odza)',
              vehicle: 'Scooter Honda Dio',
              currentCashCollected: 0,
              completedDeliveriesCount: 0,
              createdAt: new Date().toISOString(),
            },
          ];
          initialCouriers.forEach(async (c) => {
            await setDoc(doc(db, 'couriers', c.id), c).catch(() => {});
          });
          setCouriers(initialCouriers);
        }
      },
      (err) => {
        console.warn('Firestore couriers listener:', err);
      }
    );
    return () => unsub();
  }, []);

  // Expenses Listener (100% Real accounting data, starts at 0!)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'expenses'),
      (snap) => {
        const list: ExpenseItem[] = [];
        snap.forEach((d) => list.push(d.data() as ExpenseItem));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(list);
      },
      (err) => {
        console.warn('Firestore expenses listener:', err);
      }
    );
    return () => unsub();
  }, []);

  // Audit Logs Listener (100% Real traceability)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'audit_logs'),
      (snap) => {
        const list: AuditLogItem[] = [];
        snap.forEach((d) => list.push(d.data() as AuditLogItem));
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(list);
      },
      (err) => {
        console.warn('Firestore audit logs listener:', err);
      }
    );
    return () => unsub();
  }, []);

  // Shipping Rates Listener (Dynamic from 'shipping_rates' Firestore collection)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'shipping_rates'),
      (snap) => {
        if (!snap.empty) {
          const list: ShippingRate[] = [];
          snap.forEach((d) => list.push(d.data() as ShippingRate));
          setShippingRates(list);
        } else {
          // Initialize default Cameroon shipping rates in Firestore
          DEFAULT_SHIPPING_RATES.forEach(async (rate) => {
            await setDoc(doc(db, 'shipping_rates', rate.id), rate).catch(() => {});
          });
          setShippingRates(DEFAULT_SHIPPING_RATES);
        }
      },
      (err) => {
        console.warn('Firestore shipping_rates listener fallback:', err);
        setShippingRates(DEFAULT_SHIPPING_RATES);
      }
    );
    return () => unsub();
  }, []);

  // Settings Listener (Merchant codes & Admin credentials)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'merchant_codes'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.momo) setMomoMerchantCode(data.momo);
          if (data.om) setOmMerchantCode(data.om);
        } else {
          // Initialize default merchant codes in Firestore
          setDoc(doc(db, 'settings', 'merchant_codes'), {
            momo: '789012',
            om: '654321',
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Loyalty Members Listener (Club Prestige)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'loyalty_members'),
      (snap) => {
        const list: LoyaltyMember[] = [];
        snap.forEach((d) => list.push(d.data() as LoyaltyMember));
        list.sort((a, b) => (b.points || 0) - (a.points || 0));
        setLoyaltyMembers(list);
      },
      (err) => {
        console.warn('Firestore loyalty listener fallback:', err);
      }
    );
    return () => unsub();
  }, []);

  // Whitelist VIP Listener
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'whitelist'),
      (snap) => {
        if (!snap.empty) {
          const list: WhitelistEntry[] = [];
          snap.forEach((d) => list.push(d.data() as WhitelistEntry));
          setWhitelist(list);
        } else {
          // Initialize default whitelist entry for owner/direction
          const initialVip: WhitelistEntry = {
            id: 'wl-direction-01',
            phone: '+237 659 17 21 01',
            email: 'ngassaeric17@gmail.com',
            name: 'Direction Générale KamerChic',
            vipLevel: 'direction',
            discountPercent: 15,
            freeDeliveryAllRegions: true,
            notes: 'Siège Yaoundé & Fondateur',
            addedAt: new Date().toISOString(),
            isActive: true,
          };
          setDoc(doc(db, 'whitelist', initialVip.id), initialVip).catch(() => {});
          setWhitelist([initialVip]);
        }
      },
      (err) => {
        console.warn('Firestore whitelist listener fallback:', err);
      }
    );
    return () => unsub();
  }, []);

  const updateMerchantCodes = async (momo: string, om: string) => {
    setMomoMerchantCode(momo);
    setOmMerchantCode(om);
    await setDoc(doc(db, 'settings', 'merchant_codes'), {
      momo,
      om,
      updatedAt: new Date().toISOString(),
    });
    addAuditLog('Codes Marchands Modifiés', 'finance', `Codes marchands mis à jour: OM: ${om}, MoMo: ${momo}`, 'Admin', 'info');
  };

  // Cart state (offline-first, localStorage persisted)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kc_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('kc_cart', JSON.stringify(cart));
  }, [cart]);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('kc_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('kc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Delivery zones & coupons
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(SEED_DELIVERY_ZONES);
  const [coupons, setCoupons] = useState<Coupon[]>(SEED_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Filters & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Computed Cart metrics
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (cartSubtotal < appliedCoupon.minOrderValue) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      const disc = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      return appliedCoupon.maxDiscount ? Math.min(disc, appliedCoupon.maxDiscount) : disc;
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, cartSubtotal]);

  // Cart operations
  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    setCart((prev) => {
      const cartItemId = `${product.id}-${variant.id}`;
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          variantId: variant.id,
          selectedSize: variant.size,
          selectedColor: variant.color,
          quantity,
          price: product.price,
          product,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: language === 'fr' ? 'Code promo invalide' : 'Invalid coupon code' };
    }
    if (cartSubtotal < found.minOrderValue) {
      return {
        success: false,
        message:
          language === 'fr'
            ? `Ce code nécessite un panier minimum de ${formatXAF(found.minOrderValue)}`
            : `Minimum order value of ${formatXAF(found.minOrderValue)} required`,
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: language === 'fr' ? 'Code promo appliqué avec succès !' : 'Coupon applied successfully!',
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // -------------------------------------------------------------
  // REAL-TIME ORDER CREATION WITH JS AUTOMATION
  // -------------------------------------------------------------
  const placeOrder = async (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    city: string;
    quartier: string;
    landmark: string;
    deliveryFee: number;
    paymentMethod: 'om' | 'momo' | 'cod';
    merchantCode?: string;
    transactionRef?: string;
  }): Promise<Order> => {
    const uniqueId = `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNumber = generateOrderNumber();
    const now = new Date().toISOString();

    const isDigitalPaid = orderPayload.paymentMethod === 'om' || orderPayload.paymentMethod === 'momo';
    const totalAmount = Math.max(0, cartSubtotal - discountAmount + orderPayload.deliveryFee);

    const newOrder: Order = {
      id: uniqueId,
      orderNumber,
      customerId: user.uid || 'guest',
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail || '',
      deliveryAddress: {
        city: orderPayload.city,
        quartier: orderPayload.quartier,
        landmark: orderPayload.landmark,
        recipientName: orderPayload.customerName,
        phone: orderPayload.customerPhone,
      },
      deliveryZoneId: orderPayload.city.toLowerCase(),
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: orderPayload.deliveryFee,
      discount: discountAmount,
      appliedCouponCode: appliedCoupon?.code,
      total: totalAmount,
      paymentMethod: orderPayload.paymentMethod,
      merchantCode: orderPayload.merchantCode || '',
      transactionRef: orderPayload.transactionRef || '',
      paymentStatus: isDigitalPaid ? 'paid' : 'pending',
      status: 'confirmed',
      trackingEvents: [
        {
          status: 'confirmed',
          timestamp: now,
          note: {
            fr: isDigitalPaid
              ? `Paiement vérifié avec succès via Code Marchand (${orderPayload.merchantCode}). Commande confirmée pour ${orderPayload.city}.`
              : `Commande confirmée à Yaoundé / Douala. Règlement en espèces à la livraison.`,
            en: isDigitalPaid
              ? `Payment confirmed with Merchant Code (${orderPayload.merchantCode}). Order verified.`
              : `Order placed. Cash on delivery.`,
          },
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // 1. Write order to Firebase Firestore (Persists in real-time)
    try {
      await setDoc(doc(db, 'orders', uniqueId), newOrder);
    } catch (err) {
      console.error('Firestore order creation error:', err);
      // Fallback local update
      setOrders((prev) => [newOrder, ...prev]);
    }

    // 2. Add audit log
    await addAuditLog(
      'Nouvelle Commande & Paiement',
      'finance',
      `Commande ${orderNumber} de ${formatXAF(totalAmount)} enregistrée pour ${orderPayload.customerName} (${orderPayload.city}). Mode: ${orderPayload.paymentMethod.toUpperCase()}${orderPayload.merchantCode ? ` - Marchand: ${orderPayload.merchantCode}` : ''}`,
      'Client',
      'success'
    );

    // 3. Clear cart
    clearCart();
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setActiveTrackingOrder(newOrder);

    return newOrder;
  };

  // Find order by order number
  const findOrder = (num: string): Order | undefined => {
    const cleanNum = num.trim().toUpperCase();
    return orders.find(
      (o) => o.orderNumber.toUpperCase() === cleanNum || o.id.toUpperCase() === cleanNum
    );
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    noteFr = `Statut mis à jour : ${status}`,
    noteEn = `Status updated to ${status}`
  ) => {
    const now = new Date().toISOString();
    const event = {
      status,
      timestamp: now,
      note: { fr: noteFr, en: noteEn },
    };

    const targetOrder = orders.find((o) => o.id === orderId);
    const updatedEvents = targetOrder ? [...targetOrder.trackingEvents, event] : [event];

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: now,
        trackingEvents: updatedEvents,
      });
    } catch (err) {
      console.warn('Firestore update order status fallback:', err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: now, trackingEvents: updatedEvents } : o))
      );
    }

    await addAuditLog(
      'Mise à jour Statut Commande',
      'delivery',
      `Commande ${targetOrder?.orderNumber || orderId} passée au statut : ${status.toUpperCase()}`,
      'Direction',
      'info'
    );
  };

  // Assign courier to order
  const assignOrderCourier = async (
    orderId: string,
    courierId: string,
    courierName: string,
    courierPhone: string
  ) => {
    const now = new Date().toISOString();
    const targetOrder = orders.find((o) => o.id === orderId);
    const trackingEvents = targetOrder
      ? [
          ...targetOrder.trackingEvents,
          {
            status: 'in_transit' as OrderStatus,
            timestamp: now,
            note: {
              fr: `Commande prise en charge par le coursier ${courierName} (${courierPhone}). En cours de livraison.`,
              en: `Assigned to delivery agent ${courierName} (${courierPhone}). In transit.`,
            },
          },
        ]
      : [];

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        assignedAgentId: courierId,
        assignedAgentName: courierName,
        assignedAgentPhone: courierPhone,
        status: 'in_transit',
        updatedAt: now,
        trackingEvents,
      });
    } catch (err) {
      console.warn('Firestore assign courier fallback:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                assignedAgentId: courierId,
                assignedAgentName: courierName,
                assignedAgentPhone: courierPhone,
                status: 'in_transit',
                updatedAt: now,
                trackingEvents,
              }
            : o
        )
      );
    }

    await addAuditLog(
      'Livreur Assigné',
      'delivery',
      `Commande ${targetOrder?.orderNumber || orderId} confiée à ${courierName} (${courierPhone})`,
      'Direction',
      'info'
    );
  };

  // Helper to normalize phone / email for lookup
  const normalizeIdentifier = (val: string) => {
    return val.replace(/\s+/g, '').replace(/^\+237/, '').toLowerCase();
  };

  const lookupLoyaltyMember = (phoneOrEmail: string): LoyaltyMember | undefined => {
    if (!phoneOrEmail) return undefined;
    const clean = normalizeIdentifier(phoneOrEmail);
    return loyaltyMembers.find((m) => {
      const pClean = normalizeIdentifier(m.phone || '');
      const eClean = (m.email || '').trim().toLowerCase();
      return pClean === clean || (eClean && eClean === clean);
    });
  };

  const calculateTier = (points: number): LoyaltyTier => {
    if (points >= 300) return 'platine';
    if (points >= 150) return 'or';
    if (points >= 50) return 'argent';
    return 'bronze';
  };

  const addOrUpdateLoyaltyPoints = async (
    phone: string,
    name: string,
    pointsEarned: number,
    spentAmount: number
  ): Promise<LoyaltyMember> => {
    const cleanPhone = phone.trim();
    const existing = lookupLoyaltyMember(cleanPhone);
    const now = new Date().toISOString();

    const currentPoints = existing ? existing.points : 0;
    const newPoints = currentPoints + pointsEarned;
    const newTotalSpent = (existing ? existing.totalSpent : 0) + spentAmount;
    const newOrdersCount = (existing ? existing.ordersCount : 0) + 1;
    const newTier = calculateTier(newPoints);

    const memberId = existing ? existing.id : `lm-${Date.now()}`;
    const updatedMember: LoyaltyMember = {
      id: memberId,
      phone: cleanPhone,
      name: name || existing?.name || 'Client KamerChic',
      email: existing?.email || '',
      city: existing?.city || 'Yaoundé',
      points: newPoints,
      tier: newTier,
      totalSpent: newTotalSpent,
      ordersCount: newOrdersCount,
      joinedAt: existing ? existing.joinedAt : now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'loyalty_members', memberId), updatedMember);
    } catch {
      setLoyaltyMembers((prev) => {
        const idx = prev.findIndex((m) => m.id === memberId);
        if (idx >= 0) {
          const cp = [...prev];
          cp[idx] = updatedMember;
          return cp;
        }
        return [updatedMember, ...prev];
      });
    }

    addAuditLog(
      'Points Club Prestige Attribués',
      'order',
      `+${pointsEarned} pts crédités à ${name} (${cleanPhone}). Total: ${newPoints} pts (Rang: ${newTier.toUpperCase()})`,
      'Système Fidélité',
      'success'
    );

    return updatedMember;
  };

  const redeemLoyaltyPoints = async (phone: string, pointsToRedeem: number): Promise<boolean> => {
    const member = lookupLoyaltyMember(phone);
    if (!member || member.points < pointsToRedeem) return false;

    const remainingPoints = member.points - pointsToRedeem;
    const newTier = calculateTier(remainingPoints);
    const updated: LoyaltyMember = {
      ...member,
      points: remainingPoints,
      tier: newTier,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'loyalty_members', member.id), updated);
    } catch {
      setLoyaltyMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
    }

    addAuditLog(
      'Points Fidélité Déduits',
      'order',
      `Utilisation de ${pointsToRedeem} points pour ${member.name}. Solde restant: ${remainingPoints} pts`,
      member.name,
      'info'
    );
    return true;
  };

  const checkWhitelist = (phoneOrEmail: string): WhitelistEntry | undefined => {
    if (!phoneOrEmail) return undefined;
    const clean = normalizeIdentifier(phoneOrEmail);
    return whitelist.find((w) => {
      if (!w.isActive) return false;
      const pClean = normalizeIdentifier(w.phone || '');
      const eClean = (w.email || '').trim().toLowerCase();
      return pClean === clean || (eClean && eClean === clean);
    });
  };

  const addWhitelistEntry = async (entry: WhitelistEntry): Promise<void> => {
    try {
      await setDoc(doc(db, 'whitelist', entry.id), entry);
    } catch {
      setWhitelist((prev) => [entry, ...prev]);
    }
    addAuditLog(
      'Client Ajouté à la Liste Blanche VIP',
      'order',
      `VIP: ${entry.name} (${entry.phone}) enregistré (${entry.vipLevel}, remise ${entry.discountPercent}%, livraison 0 FCFA)`,
      'Direction',
      'success'
    );
  };

  const deleteWhitelistEntry = async (entryId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'whitelist', entryId));
    } catch {
      setWhitelist((prev) => prev.filter((w) => w.id !== entryId));
    }
    addAuditLog('Client Retiré de la Whitelist', 'order', `ID ${entryId} retiré de la liste blanche.`, 'Direction', 'warning');
  };

  // Complete delivery with Photo Capture & Client Signature Proof (Automates Comptabilité & Contrôlabilité)
  const completeDeliveryWithProof = async (
    orderId: string,
    proofImageBase64: string,
    clientSignatureBase64: string
  ) => {
    const now = new Date().toISOString();
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const trackingEvents = [
      ...targetOrder.trackingEvents,
      {
        status: 'delivered' as OrderStatus,
        timestamp: now,
        note: {
          fr: 'Colis remis en main propre. Preuve photo, signature client certifiée et paiement validés.',
          en: 'Delivered in person. Photo proof, signature, and payment verified.',
        },
      },
    ];

    // 1. Update Order in Firestore
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivered',
        deliveryProofImage: proofImageBase64,
        clientSignature: clientSignatureBase64,
        deliveredAt: now,
        updatedAt: now,
        paymentStatus: 'paid',
        trackingEvents,
      });
    } catch (err) {
      console.warn('Firestore delivery completion fallback:', err);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'delivered',
                deliveryProofImage: proofImageBase64,
                clientSignature: clientSignatureBase64,
                deliveredAt: now,
                updatedAt: now,
                paymentStatus: 'paid',
                trackingEvents,
              }
            : o
        )
      );
    }

    // 2. Automate Courier Cash & Completed Delivery Count (Comptabilité & Contrôlabilité)
    if (targetOrder.assignedAgentId) {
      const courier = couriers.find((c) => c.id === targetOrder.assignedAgentId);
      if (courier) {
        const isCod = targetOrder.paymentMethod === 'cod';
        const newCash = isCod ? (courier.currentCashCollected || 0) + targetOrder.total : courier.currentCashCollected;
        const newCount = (courier.completedDeliveriesCount || 0) + 1;

        try {
          await updateDoc(doc(db, 'couriers', courier.id), {
            currentCashCollected: newCash,
            completedDeliveriesCount: newCount,
          });
        } catch {
          setCouriers((prev) =>
            prev.map((c) =>
              c.id === courier.id
                ? { ...c, currentCashCollected: newCash, completedDeliveriesCount: newCount }
                : c
            )
          );
        }
      }
    }

    // 3. Automate Customer Loyalty Points (1 pt per 1 000 FCFA)
    if (targetOrder.customerPhone) {
      const pointsToAward = Math.max(1, Math.floor(targetOrder.total / 1000));
      await addOrUpdateLoyaltyPoints(
        targetOrder.customerPhone,
        targetOrder.customerName,
        pointsToAward,
        targetOrder.total
      ).catch(() => {});
    }

    // 4. Certified Audit Trail & Contrôlabilité
    const certCode = `CERT-${orderId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    await addAuditLog(
      'Livraison Conclue & Contrôlabilité Certifiée',
      'delivery',
      `Preuve certifiée [${certCode}] : Commande ${targetOrder.orderNumber} remise avec succès à ${targetOrder.customerName} (${targetOrder.deliveryAddress.city}). Règlement de ${formatXAF(targetOrder.total)} enregistré. Capture photo et signature client cryptées dans le système.`,
      targetOrder.assignedAgentName || 'Livreur KamerChic',
      'success'
    );
  };

  // Mark order as paid
  const markOrderPaid = async (orderId: string) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'paid',
        updatedAt: now,
      });
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'paid', updatedAt: now } : o))
      );
    }

    await addAuditLog('Paiement Validé', 'finance', `Paiement validé manuellement pour la commande ${orderId}`, 'Admin', 'success');
  };

  // Live Audit Logger
  const addAuditLog = async (
    action: string,
    category: AuditCategory,
    details: string,
    userOrAgent = 'Système',
    severity: 'info' | 'warning' | 'success' = 'info'
  ) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      userOrAgent,
      severity,
    };

    try {
      await setDoc(doc(db, 'audit_logs', newLog.id), newLog);
    } catch {
      setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    }
  };

  // Admin Auth (ngassaulrich17@gmail.com / Jesusloveme2026@)
  const adminLogin = async (email: string, pass: string, totp: string) => {
    const res = await authenticateAdmin(email, pass, totp);
    if (res.success && res.session) {
      setAdminSession(res.session);
      setUserRole('admin');
      addAuditLog('Connexion Direction Réussie', 'auth', `Connexion de ${email}`, email, 'success');
      return { success: true };
    }
    addAuditLog('Échec Connexion Admin', 'auth', `Tentative refusée pour ${email}`, email, 'warning');
    return { success: false, error: res.error };
  };

  const adminLogout = () => {
    localStorage.removeItem('kc_admin_session');
    setAdminSession(null);
    setUserRole('customer');
    setActivePortal('client');
    addAuditLog('Déconnexion Direction', 'auth', 'Session terminée.', 'Admin', 'info');
  };

  // Transfer Admin Credentials
  const updateAdminAccount = async (newEmail: string, newPass: string) => {
    const res = await updateAdminCredentials(newEmail, newPass);
    if (res.success) {
      addAuditLog('Propriété & Accès Transférés', 'auth', `Nouveaux accès administrateur définis pour : ${newEmail}`, 'Admin Propriétaire', 'warning');
    }
    return res;
  };

  // Courier Auth
  const courierLogin = (phone: string, pin: string) => {
    const res = authenticateCourier(phone, pin, couriers);
    if (res.success && res.session) {
      setCourierSession(res.session);
      setUserRole('delivery');
      addAuditLog('Connexion Livreur Mobile', 'delivery', `Coursier ${res.session.name} en service.`, res.session.name, 'success');
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const courierLogout = () => {
    localStorage.removeItem('kc_courier_session');
    setCourierSession(null);
    setUserRole('customer');
    setActivePortal('client');
  };

  // Courier Management
  const addCourier = async (newCourier: DeliveryAgent) => {
    try {
      await setDoc(doc(db, 'couriers', newCourier.id), newCourier);
    } catch {
      setCouriers((prev) => [newCourier, ...prev]);
    }
    addAuditLog('Nouveau Coursier Créé', 'delivery', `Livreur ${newCourier.name} (${newCourier.phone}) enregistré avec PIN d'accès.`, 'Admin', 'success');
  };

  const deleteCourier = async (courierId: string) => {
    try {
      await deleteDoc(doc(db, 'couriers', courierId));
    } catch {
      setCouriers((prev) => prev.filter((c) => c.id !== courierId));
    }
    addAuditLog('Coursier Supprimé', 'delivery', `Coursier ID ${courierId} supprimé.`, 'Admin', 'warning');
  };

  const reconcileCourierCash = async (courierId: string, amount: number, note?: string) => {
    const courier = couriers.find((c) => c.id === courierId);
    const newBal = Math.max(0, (courier?.currentCashCollected || 0) - amount);

    try {
      await updateDoc(doc(db, 'couriers', courierId), {
        currentCashCollected: newBal,
      });
    } catch {
      setCouriers((prev) =>
        prev.map((c) => (c.id === courierId ? { ...c, currentCashCollected: newBal } : c))
      );
    }

    addAuditLog(
      'Clôture Caisse Livreur',
      'finance',
      `Versement d'espèces de ${formatXAF(amount)} reçu de ${courier?.name || courierId}. Caisse magasin créditée. (${note || ''})`,
      'Direction',
      'success'
    );
  };

  // Accounting / Expenses (Real)
  const addExpense = async (expense: ExpenseItem) => {
    try {
      await setDoc(doc(db, 'expenses', expense.id), expense);
    } catch {
      setExpenses((prev) => [expense, ...prev]);
    }
    addAuditLog('Dépense Enregistrée', 'finance', `Dépense de ${formatXAF(expense.amount)} : ${expense.title}`, 'Direction', 'info');
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    }
  };

  // Product CRUD (Real)
  const addProduct = async (newProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch {
      setProducts((prev) => [newProduct, ...prev]);
    }
    addAuditLog('Article Créé', 'inventory', `Nouveau produit: ${newProduct.title.fr} (${formatXAF(newProduct.price)})`, 'Admin', 'success');
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    }
    addAuditLog('Article Modifié', 'inventory', `Mise à jour: ${updatedProduct.title.fr}`, 'Admin', 'info');
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
    addAuditLog('Article Supprimé', 'inventory', `Article ID ${productId} supprimé du catalogue.`, 'Admin', 'warning');
  };

  // Add Customer Review & Star Rating
  const addProductReview = async (
    productId: string,
    reviewData: {
      authorName: string;
      city: string;
      rating: number;
      comment: string;
      verifiedBuyer?: boolean;
    }
  ): Promise<void> => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      authorName: reviewData.authorName.trim(),
      city: reviewData.city.trim() || 'Cameroun',
      rating: Math.max(1, Math.min(5, reviewData.rating)),
      comment: reviewData.comment.trim(),
      date: new Date().toISOString().slice(0, 10),
      verifiedBuyer: reviewData.verifiedBuyer ?? true,
    };

    const updatedReviews = [newReview, ...(prod.reviews || [])];
    const totalScore = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const updatedRating = Number((totalScore / updatedReviews.length).toFixed(1));
    const updatedReviewCount = updatedReviews.length;

    const updatedProduct: Product = {
      ...prod,
      reviews: updatedReviews,
      rating: updatedRating,
      reviewCount: updatedReviewCount,
    };

    try {
      await updateDoc(doc(db, 'products', productId), {
        reviews: updatedReviews,
        rating: updatedRating,
        reviewCount: updatedReviewCount,
      });
    } catch (err) {
      console.warn('Firestore add review fallback:', err);
    }

    setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
    if (activeProductDetail && activeProductDetail.id === productId) {
      setActiveProductDetail(updatedProduct);
    }

    addAuditLog(
      'Avis Client Publié',
      'order',
      `Nouvel avis (${newReview.rating}★) déposé par ${newReview.authorName} (${newReview.city}) pour ${prod.title.fr}`,
      newReview.authorName,
      'success'
    );
  };

  // Stock Adjustment
  const adjustStock = async (productId: string, variantId: string, delta: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updatedVariants = prod.variants.map((v) => {
      if (v.id === variantId) {
        return { ...v, stock: Math.max(0, v.stock + delta) };
      }
      return v;
    });

    const updatedProd = { ...prod, variants: updatedVariants };

    try {
      await updateDoc(doc(db, 'products', productId), {
        variants: updatedVariants,
      });
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProd : p)));
    }

    addAuditLog(
      'Ajustement Stock',
      'inventory',
      `Stock ${prod.title.fr} ajusté de ${delta > 0 ? `+${delta}` : delta} unités. Motif : ${reason}`,
      'Admin',
      'info'
    );
  };

  const addCoupon = (c: Coupon) => setCoupons((prev) => [c, ...prev]);
  const deleteCoupon = (code: string) => setCoupons((prev) => prev.filter((c) => c.code !== code));
  const updateDeliveryZoneFee = (id: string, fee: number) => {
    setDeliveryZones((prev) => prev.map((z) => (z.id === id ? { ...z, fee } : z)));
  };

  // Dynamic Delivery Fee Calculation function based on town/location & Firestore shipping_rates
  const calculateDeliveryFee = (townOrLocation: string, subtotal?: number): number => {
    if (!townOrLocation) return 1500;
    const normalized = townOrLocation
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Match against dynamic Firestore shipping rates
    const matched = shippingRates.find((rate) => {
      const t = rate.town.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalized.includes(t) || t.includes(normalized) || rate.id.toLowerCase() === normalized;
    });

    const effectiveSubtotal = subtotal !== undefined ? subtotal : cartSubtotal;

    if (!matched) {
      return 3500; // General Cameroon delivery fallback
    }

    // Free delivery check if threshold met and city is eligible
    const isFreeEligible = matched.freeShippingEligible ?? (matched.town === 'Yaoundé' || matched.town === 'Douala');
    const threshold = matched.minOrderForFreeShipping || FREE_SHIPPING_THRESHOLD;
    if (isFreeEligible && effectiveSubtotal >= threshold) {
      return 0;
    }

    return matched.fee;
  };

  const getShippingRateForTown = (townOrLocation: string): ShippingRate | undefined => {
    if (!townOrLocation) return undefined;
    const normalized = townOrLocation
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return shippingRates.find((rate) => {
      const t = rate.town.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalized.includes(t) || t.includes(normalized) || rate.id.toLowerCase() === normalized;
    });
  };

  const updateShippingRate = async (rate: ShippingRate): Promise<void> => {
    try {
      await setDoc(doc(db, 'shipping_rates', rate.id), rate);
    } catch {
      setShippingRates((prev) => prev.map((r) => (r.id === rate.id ? rate : r)));
    }
    addAuditLog('Tarif Livraison Modifié', 'delivery', `Tarif pour ${rate.town} ajusté à ${formatXAF(rate.fee)}`, 'Direction', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        user,
        language,
        t,
        deliveryZones,
        shippingRates,
        calculateDeliveryFee,
        getShippingRateForTown,
        updateShippingRate,
        coupons,
        appliedCoupon,
        searchQuery,
        selectedCategory,
        activeProductDetail,
        isCartOpen,
        isCheckoutOpen,
        activeTrackingOrder,
        isSizeGuideOpen,
        cartSubtotal,
        cartItemCount,
        discountAmount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        activePortal,
        setActivePortal,
        adminSession,
        courierSession,
        couriers,
        expenses,
        auditLogs,
        newPaymentAlert,
        dismissPaymentAlert,
        momoMerchantCode,
        omMerchantCode,
        updateMerchantCodes,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateOrderStatus,
        assignOrderCourier,
        completeDeliveryWithProof,
        markOrderPaid,
        setLanguage,
        setUserRole,
        setSearchQuery,
        setSelectedCategory,
        setActiveProductDetail,
        setIsCartOpen,
        setIsCheckoutOpen,
        setActiveTrackingOrder,
        setIsSizeGuideOpen,
        findOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        addProductReview,
        addCoupon,
        deleteCoupon,
        updateDeliveryZoneFee,
        adminLogin,
        adminLogout,
        updateAdminAccount,
        courierLogin,
        courierLogout,
        addCourier,
        deleteCourier,
        reconcileCourierCash,
        addExpense,
        deleteExpense,
        adjustStock,
        addAuditLog,
        // Loyalty & Whitelist VIP
        loyaltyMembers,
        whitelist,
        isLoyaltyModalOpen,
        setIsLoyaltyModalOpen,
        lookupLoyaltyMember,
        addOrUpdateLoyaltyPoints,
        redeemLoyaltyPoints,
        checkWhitelist,
        addWhitelistEntry,
        deleteWhitelistEntry,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

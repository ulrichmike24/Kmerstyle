import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Truck,
  Sparkles,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  X,
  Phone,
  Printer,
  ShieldCheck,
  LogOut,
  Activity,
  Calculator,
  Boxes,
  Users,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Banknote,
  KeyRound,
  RotateCw,
  Settings,
  Bell,
  Camera,
  Eye,
  Smartphone,
  Crown,
  Award,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  Product,
  Order,
  OrderStatus,
  ProductCategory,
  ProductGender,
  ProductVariant,
  Coupon,
  DeliveryAgent,
  ExpenseItem,
  ExpenseCategory,
  LoyaltyMember,
  WhitelistEntry,
  WhitelistVipLevel,
} from '../../types';
import { formatXAF, formatDate } from '../../lib/formatters';

export const AdminPortal: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    assignOrderCourier,
    markOrderPaid,
    deliveryZones,
    updateDeliveryZoneFee,
    coupons,
    addCoupon,
    deleteCoupon,
    couriers,
    addCourier,
    deleteCourier,
    reconcileCourierCash,
    expenses,
    addExpense,
    deleteExpense,
    auditLogs,
    adjustStock,
    adminSession,
    adminLogout,
    setActivePortal,
    language,
    shippingRates,
    updateShippingRate,
    loyaltyMembers,
    whitelist,
    addOrUpdateLoyaltyPoints,
    addWhitelistEntry,
    deleteWhitelistEntry,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'accounting' | 'products' | 'orders' | 'couriers' | 'coupons' | 'zones' | 'fidelite' | 'whitelist' | 'ai-copywriter'
  >('dashboard');

  // Loyalty & Whitelist States
  const [loyaltySearch, setLoyaltySearch] = useState('');
  const [whitelistSearch, setWhitelistSearch] = useState('');
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [wlName, setWlName] = useState('');
  const [wlPhone, setWlPhone] = useState('+237 6');
  const [wlEmail, setWlEmail] = useState('');
  const [wlVipLevel, setWlVipLevel] = useState<WhitelistVipLevel>('vip');
  const [wlDiscountPercent, setWlDiscountPercent] = useState<number>(10);
  const [wlFreeDelivery, setWlFreeDelivery] = useState(true);
  const [wlNotes, setWlNotes] = useState('');

  // Manual Bonus Points State
  const [bonusMember, setBonusMember] = useState<LoyaltyMember | null>(null);
  const [bonusPoints, setBonusPoints] = useState<number>(50);
  const [bonusReason, setBonusReason] = useState('Geste commercial & fidélité VIP');

  // Product CRUD states
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [formTitleFr, setFormTitleFr] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formDescFr, setFormDescFr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('men');
  const [formSubCategory, setFormSubCategory] = useState('Prêt-à-porter');
  const [formGender, setFormGender] = useState<ProductGender>('men');
  const [formPrice, setFormPrice] = useState<number>(45000);
  const [formCompareAt, setFormCompareAt] = useState<number>(60000);
  const [formCostPrice, setFormCostPrice] = useState<number>(25000);
  const [formBrand, setFormBrand] = useState('KamerChic Couture');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFabric, setFormFabric] = useState('');
  const [formStock, setFormStock] = useState<number>(10);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Stock Adjustment Modal
  const [stockModalItem, setStockModalItem] = useState<{
    product: Product;
    variant: ProductVariant;
  } | null>(null);
  const [stockAdjustmentDelta, setStockAdjustmentDelta] = useState<number>(5);
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState('Réapprovisionnement atelier Douala');

  // New Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(25000);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('delivery_fuel');
  const [expenseNotes, setExpenseNotes] = useState('');

  // New Courier Modal State
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierPhone, setNewCourierPhone] = useState('+237 6');
  const [newCourierPin, setNewCourierPin] = useState('2025');
  const [newCourierZone, setNewCourierZone] = useState('Douala Centre');
  const [newCourierVehicle, setNewCourierVehicle] = useState('Moto 125cc');

  // Orders Filter & Modals
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [assigningCourierOrder, setAssigningCourierOrder] = useState<Order | null>(null);
  const [selectedCourierId, setSelectedCourierId] = useState(couriers[0]?.id || '');

  // Courier Cash Reconciliation State
  const [selectedReconcileCourier, setSelectedReconcileCourier] = useState<DeliveryAgent | null>(null);
  const [reconcileAmount, setReconcileAmount] = useState<number>(0);
  const [reconcileNotes, setReconcileNotes] = useState('Versement caisse principale showroom Akwa');

  // Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscountType, setNewCouponDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(20000);

  // ================= FINANCIAL METRICS & ACCOUNTING =================
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  // Estimated Cost of Goods Sold (approx 45% of retail price if costPrice not set)
  const totalCogs = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => {
        const orderCost = o.items.reduce((itemSum, item) => {
          const cost = item.product.costPrice || Math.round(item.price * 0.45);
          return itemSum + cost * item.quantity;
        }, 0);
        return sum + orderCost;
      }, 0);
  }, [orders]);

  const grossProfit = totalRevenue - totalCogs;
  const grossMarginPercentage = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netOperatingProfit = grossProfit - totalExpensesAmount;

  // Real-time Cash breakdown
  const momoBalance = useMemo(() => {
    return orders
      .filter((o) => o.paymentMethod === 'momo' && o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const omBalance = useMemo(() => {
    return orders
      .filter((o) => o.paymentMethod === 'om' && o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const cashInCourierHands = useMemo(() => {
    return couriers.reduce((sum, c) => sum + (c.currentCashCollected || 0), 0);
  }, [couriers]);

  // ================= INVENTORY VALUATION =================
  const totalInventoryUnits = useMemo(() => {
    return products.reduce((sum, p) => {
      return sum + p.variants.reduce((vSum, v) => vSum + v.stock, 0);
    }, 0);
  }, [products]);

  const totalInventoryRetailValue = useMemo(() => {
    return products.reduce((sum, p) => {
      const pStock = p.variants.reduce((vSum, v) => vSum + v.stock, 0);
      return sum + p.price * pStock;
    }, 0);
  }, [products]);

  const totalInventoryCostValue = useMemo(() => {
    return products.reduce((sum, p) => {
      const pStock = p.variants.reduce((vSum, v) => vSum + v.stock, 0);
      const unitCost = p.costPrice || Math.round(p.price * 0.45);
      return sum + unitCost * pStock;
    }, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      return stock <= 3;
    });
  }, [products]);

  // Open modal for editing product
  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setFormTitleFr(p.title.fr);
    setFormTitleEn(p.title.en);
    setFormDescFr(p.description.fr);
    setFormDescEn(p.description.en);
    setFormCategory(p.category);
    setFormSubCategory(p.subCategory);
    setFormGender(p.gender);
    setFormPrice(p.price);
    setFormCompareAt(p.compareAtPrice || 0);
    setFormCostPrice(p.costPrice || Math.round(p.price * 0.45));
    setFormBrand(p.brand);
    setFormImageUrl(p.images[0] || '');
    setFormFabric(p.fabricOrMaterial || '');
    const currentStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    setFormStock(currentStock);
    setIsProductModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setFormTitleFr('');
    setFormTitleEn('');
    setFormDescFr('');
    setFormDescEn('');
    setFormCategory('men');
    setFormSubCategory('Cérémonie & Traditionnel');
    setFormGender('men');
    setFormPrice(65000);
    setFormCompareAt(85000);
    setFormCostPrice(30000);
    setFormBrand('KamerChic Couture');
    setFormImageUrl('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85');
    setFormFabric('100% Coton Bazin Riche');
    setFormStock(8);
    setIsProductModalOpen(true);
  };

  const handleGenerateAiDescription = async () => {
    if (!formTitleFr) {
      alert('Veuillez d’abord saisir le nom du produit.');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitleFr,
          category: formCategory,
          gender: formGender,
          fabric: formFabric,
          price: formPrice,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.descriptionFr) setFormDescFr(data.descriptionFr);
        if (data.descriptionEn) setFormDescEn(data.descriptionEn);
      } else {
        throw new Error('API server error');
      }
    } catch {
      setFormDescFr(
        `Une création remarquable issue du savoir-faire artisanal KamerChic : "${formTitleFr}". Confectionnée dans des matières nobles (${formFabric || 'tissu de confection noble'}) pour sublimer votre prestance lors des grands mariages, réceptions et galas à Douala et Yaoundé. Finitions main soignées, tombé royal et tissu respirant adapté au climat tropical.`
      );
      setFormDescEn(
        `A distinguished luxury creation from KamerChic: "${formTitleFr}". Tailored from prestigious textiles (${formFabric || 'exceptional fabrics'}) to elevate your appearance at weddings, galas, and stately celebrations in Cameroon. Handcrafted finish and breathable comfort designed for tropical climates.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleFr.trim() || !formPrice) return;

    const variants: ProductVariant[] = editingProduct?.variants || [
      { id: `v-${Date.now()}-m`, size: 'M', color: 'Noir Onyx', colorHex: '#18181B', stock: Math.ceil(formStock / 2), sku: `KC-${Date.now()}-M` },
      { id: `v-${Date.now()}-l`, size: 'L', color: 'Noir Onyx', colorHex: '#18181B', stock: Math.floor(formStock / 2), sku: `KC-${Date.now()}-L` },
    ];

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: { fr: formTitleFr, en: formTitleEn || formTitleFr },
        description: { fr: formDescFr, en: formDescEn || formDescFr },
        category: formCategory,
        subCategory: formSubCategory,
        gender: formGender,
        price: formPrice,
        compareAtPrice: formCompareAt > formPrice ? formCompareAt : undefined,
        costPrice: formCostPrice,
        brand: formBrand,
        images: formImageUrl ? [formImageUrl, ...editingProduct.images.slice(1)] : editingProduct.images,
        fabricOrMaterial: formFabric,
        variants: variants.map((v) => ({ ...v, stock: Math.max(1, Math.round(formStock / variants.length)) })),
      };
      updateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        title: { fr: formTitleFr, en: formTitleEn || formTitleFr },
        description: { fr: formDescFr, en: formDescEn || formDescFr },
        category: formCategory,
        subCategory: formSubCategory,
        gender: formGender,
        price: formPrice,
        compareAtPrice: formCompareAt > formPrice ? formCompareAt : undefined,
        costPrice: formCostPrice,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85'],
        rating: 5.0,
        reviewCount: 1,
        brand: formBrand,
        fabricOrMaterial: formFabric,
        isNewArrival: true,
        variants,
        reviews: [],
        completeLookIds: [],
      };
      addProduct(newProd);
    }

    setIsProductModalOpen(false);
  };

  const handleApplyStockAdjustment = () => {
    if (!stockModalItem) return;
    adjustStock(
      stockModalItem.product.id,
      stockModalItem.variant.id,
      stockAdjustmentDelta,
      stockAdjustmentReason
    );
    setStockModalItem(null);
  };

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) return;

    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: expenseTitle,
      category: expenseCategory,
      amount: expenseAmount,
      date: new Date().toISOString().slice(0, 10),
      recordedBy: 'Direction KamerChic',
      notes: expenseNotes,
    };
    addExpense(newExp);
    setExpenseTitle('');
    setExpenseAmount(25000);
    setExpenseNotes('');
    setIsExpenseModalOpen(false);
  };

  const handleCreateCourierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName.trim() || !newCourierPhone.trim() || !newCourierPin.trim()) return;

    const newAgent: DeliveryAgent = {
      id: `courier-${Date.now()}`,
      name: newCourierName,
      phone: newCourierPhone,
      pin: newCourierPin,
      active: true,
      zone: newCourierZone,
      vehicle: newCourierVehicle,
      currentCashCollected: 0,
      completedDeliveriesCount: 0,
      createdAt: new Date().toISOString(),
    };
    addCourier(newAgent);
    setNewCourierName('');
    setNewCourierPhone('+237 6');
    setNewCourierPin('2025');
    setIsCourierModalOpen(false);
  };

  const handleConfirmCourierAssignment = () => {
    if (!assigningCourierOrder) return;
    const agent = couriers.find((c) => c.id === selectedCourierId) || couriers[0];
    if (agent) {
      assignOrderCourier(assigningCourierOrder.id, agent.id, agent.name, agent.phone);
    }
    setAssigningCourierOrder(null);
  };

  const handleAddWhitelistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlName.trim() || !wlPhone.trim()) return;

    const newVip: WhitelistEntry = {
      id: `wl-${Date.now()}`,
      name: wlName.trim(),
      phone: wlPhone.trim(),
      email: wlEmail.trim() || undefined,
      vipLevel: wlVipLevel,
      discountPercent: wlDiscountPercent,
      freeDeliveryAllRegions: wlFreeDelivery,
      notes: wlNotes.trim() || undefined,
      addedAt: new Date().toISOString(),
      isActive: true,
    };
    addWhitelistEntry(newVip);
    setWlName('');
    setWlPhone('+237 6');
    setWlEmail('');
    setWlNotes('');
    setIsWhitelistModalOpen(false);
  };

  const handleApplyBonusPoints = () => {
    if (!bonusMember || bonusPoints <= 0) return;
    addOrUpdateLoyaltyPoints(
      bonusMember.phone,
      bonusMember.name,
      bonusPoints,
      0
    );
    setBonusMember(null);
    setBonusPoints(50);
  };

  const filteredLoyaltyMembers = useMemo(() => {
    return loyaltyMembers.filter((m) => {
      const q = loyaltySearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.tier.toLowerCase().includes(q)
      );
    });
  }, [loyaltyMembers, loyaltySearch]);

  const filteredWhitelist = useMemo(() => {
    return whitelist.filter((w) => {
      const q = whitelistSearch.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.phone.toLowerCase().includes(q) ||
        (w.email && w.email.toLowerCase().includes(q)) ||
        w.vipLevel.toLowerCase().includes(q)
      );
    });
  }, [whitelist, whitelistSearch]);

  // CSV Exports
  const handleExportAccountingCsv = () => {
    const headers = ['Type', 'Intitule', 'Montant_FCFA', 'Date', 'Categorie_ou_Methode'];
    const expenseRows = expenses.map((e) => ['DEPENSE', `"${e.title}"`, -e.amount, e.date, e.category]);
    const orderRows = orders
      .filter((o) => o.paymentStatus === 'paid')
      .map((o) => ['VENTE', `"${o.orderNumber} - ${o.customerName}"`, o.total, o.createdAt.slice(0, 10), o.paymentMethod]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...expenseRows.map((r) => r.join(',')), ...orderRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kamerchic-comptabilite-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Admin Secure Header */}
      <header className="bg-stone-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-stone-800 shrink-0 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePortal('client')}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Aperçu de la Boutique Client"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Boutique Client</span>
          </button>
          <button
            onClick={() => setActivePortal('delivery')}
            className="flex items-center gap-1.5 text-xs text-amber-200 hover:text-white bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Accéder au Portail des Livreurs"
          >
            <Truck size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Portail Livreurs</span>
          </button>
          <div className="h-4 w-px bg-stone-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-serif font-extrabold text-base sm:text-lg tracking-wider text-amber-400">
              KAMER<span className="text-white">CHIC</span>
            </span>
            <span className="text-xs uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
              ADMIN PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-stone-300 text-xs">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span className="font-mono text-emerald-400 font-bold">2FA JWT Actif</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">{adminSession?.email || 'admin@kamerchic.cm'}</span>
          </div>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800/80 text-xs font-bold transition-colors cursor-pointer"
            title="Clôturer la session sécurisée"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-3 sm:p-4 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'dashboard' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard size={17} className={activeTab === 'dashboard' ? 'text-amber-400' : 'text-stone-500'} />
            <span>Tableau de Bord Live</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'inventory' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes size={17} className={activeTab === 'inventory' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Gestion des Stocks</span>
            </div>
            {lowStockProducts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('accounting')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'accounting' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Calculator size={17} className={activeTab === 'accounting' ? 'text-amber-400' : 'text-stone-500'} />
            <span>Comptabilité & Marge</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'products' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={17} className={activeTab === 'products' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Articles & CRUD</span>
            </div>
            <span className="bg-stone-200 text-stone-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'orders' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={17} className={activeTab === 'orders' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Commandes & Ventes</span>
            </div>
            <span className="bg-stone-200 text-stone-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('couriers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'couriers' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={17} className={activeTab === 'couriers' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Gestion des Coursiers</span>
            </div>
            <span className="bg-stone-200 text-stone-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {couriers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'coupons' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Ticket size={17} className={activeTab === 'coupons' ? 'text-amber-400' : 'text-stone-500'} />
            <span>Codes Promo</span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'zones' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Truck size={17} className={activeTab === 'zones' ? 'text-amber-400' : 'text-stone-500'} />
            <span>Zones de Livraison</span>
          </button>
          <button
            onClick={() => setActiveTab('fidelite')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'fidelite' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Crown size={17} className={activeTab === 'fidelite' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Club Prestige (Fidélité)</span>
            </div>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {loyaltyMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('whitelist')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'whitelist' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck size={17} className={activeTab === 'whitelist' ? 'text-amber-400' : 'text-stone-500'} />
              <span>Liste Blanche VIP</span>
            </div>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {whitelist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai-copywriter')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              activeTab === 'ai-copywriter' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Sparkles size={17} className="text-amber-500" />
            <span>Générateur IA Gemini</span>
          </button>

          <div className="pt-4 border-t border-stone-200 mt-4 space-y-1.5">
            <button
              onClick={handleExportAccountingCsv}
              className="w-full flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-medium"
            >
              <FileSpreadsheet size={14} className="text-emerald-700" />
              <span>Exporter Comptabilité</span>
            </button>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
          {/* TAB 1: LIVE DASHBOARD & AUDIT STREAM */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
                    Tableau de Bord Live & Traçabilité
                  </h1>
                  <p className="text-xs text-stone-500">
                    Contrôle centralisé du système avec flux d'événements et trésorerie en direct.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('accounting')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
                  >
                    <Calculator size={14} />
                    <span>Voir Comptabilité</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                    <span>Chiffre d'Affaires</span>
                    <TrendingUp size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black font-mono text-stone-900 mt-2">
                    {formatXAF(totalRevenue)}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
                    Marge brute estimée : {grossMarginPercentage}%
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                    <span>Valeur du Stock</span>
                    <Boxes size={16} className="text-amber-700" />
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-900 mt-2">
                    {formatXAF(totalInventoryRetailValue)}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    {totalInventoryUnits} unités physiques en stock
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                    <span>Bénéfice Net Actuel</span>
                    <DollarSign size={16} className="text-blue-700" />
                  </div>
                  <div className="text-2xl font-black font-mono text-stone-900 mt-2">
                    {formatXAF(netOperatingProfit)}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    Après déduction de {formatXAF(totalExpensesAmount)} de frais
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                    <span>Espèces en Transit</span>
                    <Banknote size={16} className="text-yellow-600" />
                  </div>
                  <div className="text-2xl font-black font-mono text-yellow-900 mt-2">
                    {formatXAF(cashInCourierHands)}
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    En mains des livreurs ({couriers.length} actifs)
                  </span>
                </div>
              </div>

              {/* Live Traceable Activity Feed */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-amber-700 animate-pulse" />
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Flux d'Activité Système en Temps Réel (Journal d'Audit)
                    </h3>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    {auditLogs.length} événements enregistrés
                  </span>
                </div>

                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1 space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="pt-2.5 flex items-start justify-between text-xs gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          log.severity === 'success'
                            ? 'bg-emerald-500'
                            : log.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-bold text-stone-900">
                            {log.action} <span className="text-stone-400 font-normal">par {log.userOrAgent}</span>
                          </p>
                          <p className="text-stone-600 mt-0.5">{log.details}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {formatDate(log.timestamp, language)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Gestion des Stocks & Inventaire
                  </h1>
                  <p className="text-xs text-stone-500">
                    Ajustez les quantités physiques, suivez les ruptures et valorisez votre stock.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs flex gap-4 font-mono font-bold">
                  <div>Valeur Vente : <span className="text-amber-900">{formatXAF(totalInventoryRetailValue)}</span></div>
                  <div>Valeur Coût : <span className="text-stone-700">{formatXAF(totalInventoryCostValue)}</span></div>
                </div>
              </div>

              {/* Stock Overview Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Article</th>
                        <th className="py-3 px-4">Variante (Taille / Couleur)</th>
                        <th className="py-3 px-4">SKU / Réf</th>
                        <th className="py-3 px-4">Stock Actuel</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4 text-right">Ajustement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products.map((p) =>
                        p.variants.map((v) => (
                          <tr key={`${p.id}-${v.id}`} className="hover:bg-stone-50">
                            <td className="py-2.5 px-4 font-bold text-stone-900">
                              {p.title.fr}
                            </td>
                            <td className="py-2.5 px-4">
                              {v.size} • {v.color}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-stone-400">
                              {v.sku}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-sm">
                              {v.stock}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  v.stock === 0
                                    ? 'bg-red-100 text-red-800'
                                    : v.stock <= 3
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {v.stock === 0 ? 'Rupture' : v.stock <= 3 ? 'Alerte Critique' : 'En Stock'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setStockModalItem({ product: p, variant: v });
                                  setStockAdjustmentDelta(5);
                                }}
                                className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold text-stone-700"
                              >
                                Réajuster (+/-)
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNTING & COMPTABILITE */}
          {activeTab === 'accounting' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Comptabilité & Compte de Résultat
                  </h1>
                  <p className="text-xs text-stone-500">
                    Suivi analytique des ventes, coût des marchandises (COGS), dépenses opérationnelles et trésorerie.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow"
                  >
                    <Plus size={15} />
                    <span>Enregistrer une Dépense</span>
                  </button>
                  <button
                    onClick={handleExportAccountingCsv}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Financial Balance Summary */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-2">
                  Compte de Résultat Simplifié (XAF)
                </h3>

                <div className="space-y-3 text-xs divide-y divide-stone-100">
                  <div className="flex justify-between py-1.5 font-bold text-stone-900 text-sm">
                    <span>(+) Chiffre d'Affaires Brut (Ventes encaissées)</span>
                    <span className="font-mono">{formatXAF(totalRevenue)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 text-stone-600">
                    <span>(-) Coût d'Achat des Marchandises Vendues (COGS)</span>
                    <span className="font-mono text-red-600">-{formatXAF(totalCogs)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 font-bold text-emerald-800 bg-emerald-50 px-3 rounded-lg">
                    <span>(=) Marge Brute Opérationnelle (Taux: {grossMarginPercentage}%)</span>
                    <span className="font-mono">{formatXAF(grossProfit)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 text-stone-600">
                    <span>(-) Dépenses Opérationnelles d'Exploitation</span>
                    <span className="font-mono text-red-600">-{formatXAF(totalExpensesAmount)}</span>
                  </div>

                  <div className="flex justify-between py-2 font-black text-base text-stone-900 border-t-2 border-stone-900">
                    <span>(=) Bénéfice Net d'Exploitation</span>
                    <span className="font-mono text-amber-900">{formatXAF(netOperatingProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Trésorerie en Temps Réel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-yellow-50/70 border border-yellow-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-yellow-800 uppercase block">Compte MTN MoMo Marchand</span>
                  <div className="text-xl font-mono font-black text-stone-900 mt-1">{formatXAF(momoBalance)}</div>
                  <span className="text-[10px] text-stone-500">Débits USSD reçus</span>
                </div>

                <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-orange-800 uppercase block">Compte Orange Money Marchand</span>
                  <div className="text-xl font-mono font-black text-stone-900 mt-1">{formatXAF(omBalance)}</div>
                  <span className="text-[10px] text-stone-500">Collectes #150# reçues</span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cash Collecté en Main Propre</span>
                  <div className="text-xl font-mono font-black text-stone-900 mt-1">{formatXAF(cashInCourierHands)}</div>
                  <span className="text-[10px] text-stone-500">En possession des coursiers</span>
                </div>
              </div>

              {/* Expenses Table */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
                <h3 className="font-serif font-bold text-sm text-stone-900">
                  Dernières Dépenses Opérationnelles Enregistrées
                </h3>

                <div className="divide-y divide-stone-100 text-xs">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-900">{exp.title}</p>
                        <p className="text-stone-400 text-[11px]">{exp.date} • Catégorie : {exp.category} • {exp.notes}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-red-600">-{formatXAF(exp.amount)}</span>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="text-stone-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS CRUD (Same as before with costPrice) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Catalogue & Gestion des Articles (CRUD)
                  </h1>
                  <p className="text-xs text-stone-500">
                    Ajoutez, modifiez le nom, les prix, les photos et les variantes en temps réel.
                  </p>
                </div>

                <button
                  onClick={handleAddNewClick}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 hover:bg-amber-800 text-white text-xs font-bold shadow cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Nouveau Produit</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">Prix Vente</th>
                      <th className="py-3 px-4">Coût Achat (COGS)</th>
                      <th className="py-3 px-4">Stock Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((p) => {
                      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                      const unitCost = p.costPrice || Math.round(p.price * 0.45);

                      return (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-lg border border-stone-200 shrink-0" />
                              <div>
                                <p className="font-bold text-stone-900 line-clamp-1">{p.title.fr}</p>
                                <p className="text-stone-400 text-[11px]">{p.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 uppercase text-[11px]">{p.category}</td>
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">{formatXAF(p.price)}</td>
                          <td className="py-3 px-4 font-mono text-stone-500">{formatXAF(unitCost)}</td>
                          <td className="py-3 px-4 font-mono font-bold">{totalStock} unités</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(p)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                                title="Modifier"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & DELIVERIES */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">Commandes & Suivi Ventes</h1>
                  <p className="text-xs text-stone-500">Validez les encaissements et assignez les livreurs.</p>
                </div>
              </div>

              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl p-5 border border-stone-200 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-stone-100 text-xs">
                      <div>
                        <span className="font-mono font-bold text-stone-900">{o.orderNumber}</span> • {o.customerName} ({o.customerPhone})
                      </div>
                      <span className="font-mono font-bold text-amber-900 text-sm">{formatXAF(o.total)}</span>
                    </div>

                    <div className="text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p><strong>📍 Adresse :</strong> {o.deliveryAddress.city} - {o.deliveryAddress.quartier} ("{o.deliveryAddress.landmark}")</p>
                      <p><strong>Paiement :</strong> <span className="font-semibold uppercase">{o.paymentMethod}</span> ({o.paymentStatus === 'paid' ? 'Payé' : 'En attente encaissement'})</p>
                      <p><strong>Livreur :</strong> {o.assignedAgentName || 'Non assigné'} {o.assignedAgentPhone && `(${o.assignedAgentPhone})`}</p>
                      <div className="flex items-center gap-2">
                        <strong>Statut :</strong>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus, `Statut modifié par la direction en : ${e.target.value}`, `Status updated by management to: ${e.target.value}`)}
                          className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-0.5 text-xs font-bold text-stone-800"
                        >
                          <option value="pending">En attente (Pending)</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="processing">En préparation</option>
                          <option value="in_transit">En cours de livraison</option>
                          <option value="delivered">Livrée ✓</option>
                          <option value="cancelled">Annulée ✗</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-100">
                      {o.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => markOrderPaid(o.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          ✓ Encaissé (Paiement Validé)
                        </button>
                      )}
                      <button
                        onClick={() => setAssigningCourierOrder(o)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Assigner un Livreur
                      </button>

                      {/* WhatsApp Client Notification Hook */}
                      <button
                        onClick={() => {
                          const cleanPhone = o.customerPhone.replace(/[\s\+]/g, '');
                          const msg = encodeURIComponent(
                            `Bonjour ${o.customerName}, ici la Maison KamerChic. Votre commande Réf: ${o.orderNumber} (Montant: ${formatXAF(o.total)}) est passée au statut : ${o.status.toUpperCase()}. Notre équipe à Douala reste à votre entière disposition.`
                          );
                          window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                        }}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Phone size={13} />
                        <span>WhatsApp Client</span>
                      </button>

                      {/* WhatsApp Courier Dispatch Hook */}
                      {o.assignedAgentPhone && (
                        <button
                          onClick={() => {
                            const courierPhone = o.assignedAgentPhone!.replace(/[\s\+]/g, '');
                            const itemsText = o.items.map((i) => `• ${i.quantity}x ${i.product.title.fr} (${i.selectedSize})`).join('%0A');
                            const msg = encodeURIComponent(
                              `📦 *ORDRE DE MISSION KAMERCHIC*\n\n*Réf Commande :* ${o.orderNumber}\n*Client :* ${o.customerName}\n*Téléphone Client :* ${o.customerPhone}\n*Ville & Quartier :* ${o.deliveryAddress.city} - ${o.deliveryAddress.quartier}\n*Repère Visuel :* "${o.deliveryAddress.landmark}"\n\n*Articles :*\n${itemsText}\n\n*Montant à encaisser :* ${o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' ? `${formatXAF(o.total)} (EN ESPÈCES)` : 'DÉJÀ RÉGLÉ'}`
                            );
                            window.open(`https://wa.me/${courierPhone}?text=${msg}`, '_blank');
                          }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Truck size={13} />
                          <span>WhatsApp Livreur</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrderForInvoice(o)}
                        className="px-3 py-1.5 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>Bordereau / Facture</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COURIERS MANAGEMENT (Admin creates & controls access) */}
          {activeTab === 'couriers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    Gestion des Coursiers & Accès PIN
                  </h1>
                  <p className="text-xs text-stone-500">
                    Créez les comptes des livreurs et attribuez-leur leur code secret PIN d'accès mobile.
                  </p>
                </div>

                <button
                  onClick={() => setIsCourierModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow"
                >
                  <Plus size={15} />
                  <span>Enregistrer un Nouveau Livreur</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {couriers.map((courier) => (
                  <div key={courier.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                          <Truck size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-stone-900">{courier.name}</h3>
                          <p className="text-xs text-stone-500 font-mono">{courier.phone}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Actif
                      </span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                      <p><strong>Code PIN Secret de Connexion :</strong> <span className="font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{courier.pin}</span></p>
                      <p><strong>Secteur Attribué :</strong> {courier.zone}</p>
                      <p><strong>Véhicule :</strong> {courier.vehicle}</p>
                      <p><strong>Cash en Main Propre :</strong> <span className="font-mono font-bold text-emerald-700">{formatXAF(courier.currentCashCollected)}</span></p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      {courier.currentCashCollected > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedReconcileCourier(courier);
                            setReconcileAmount(courier.currentCashCollected);
                            setReconcileNotes(`Versement caisse showroom tournée ${courier.zone}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Banknote size={14} />
                          <span>Encaisser & Clôturer ({formatXAF(courier.currentCashCollected)})</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-medium italic">
                          Caisse à jour (0 FCFA en main)
                        </span>
                      )}

                      <button
                        onClick={() => deleteCourier(courier.id)}
                        className="text-stone-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 p-1 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Révoquer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl font-bold text-stone-900">Codes Promotionnels</h1>
              <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
                {coupons.map((c) => (
                  <div key={c.code} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-sm bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">{c.code}</span>
                      <p className="text-stone-600 mt-1">{c.description.fr}</p>
                    </div>
                    <button onClick={() => deleteCoupon(c.code)} className="text-stone-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ZONES / SHIPPING RATES */}
          {activeTab === 'zones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">Tarifs de Livraison par Ville (Firestore)</h1>
                  <p className="text-xs text-stone-600 mt-1">
                    Grille tarifaire dynamique synchronisée en direct avec la collection <code className="bg-stone-200 px-1 py-0.5 rounded text-amber-900 font-mono">shipping_rates</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shippingRates.map((rate) => (
                  <div key={rate.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-stone-900">{rate.town}</h3>
                        <p className="text-[11px] text-stone-500 font-medium">{rate.region}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                        {rate.id}
                      </span>
                    </div>

                    <p className="text-stone-600 text-[11px]">
                      ⏱️ {rate.deliveryTime?.fr || 'Livraison standard'}
                    </p>

                    <div className="pt-2 border-t border-stone-100">
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Frais appliqués au panier (XAF)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={rate.fee}
                          onChange={(e) => updateShippingRate({ ...rate, fee: Number(e.target.value) })}
                          className="bg-stone-50 border border-stone-200 rounded-lg p-2 font-mono font-bold w-full text-stone-900 focus:outline-none focus:border-amber-700"
                        />
                        <span className="font-bold text-stone-600 shrink-0">FCFA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: GEMINI AI COPYWRITER */}
          {activeTab === 'ai-copywriter' && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-amber-700">
                <Sparkles size={20} />
                <h2 className="font-serif font-bold text-xl text-stone-900">Assistant Rédactionnel IA Gemini</h2>
              </div>
              <p className="text-xs text-stone-600">
                Générez des fiches articles prestigieuses en français et en anglais avec le vocabulaire camerounais.
              </p>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-amber-700 text-white rounded-full text-xs font-bold cursor-pointer"
              >
                {isGeneratingAi ? 'Génération...' : 'Tester le Générateur IA'}
              </button>
            </div>
          {/* TAB: CLUB PRESTIGE FIDELITE */}
          {activeTab === 'fidelite' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-2.5">
                    <Crown size={28} className="text-amber-600 fill-amber-500/20" />
                    <span>Club Prestige & Fidélité Clients</span>
                  </h1>
                  <p className="text-xs text-stone-500">
                    Gestion des points fidélité (1 pt par 1 000 FCFA), passages de rangs et attributions de bonus exclusifs.
                  </p>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Membres Inscrits
                  </span>
                  <span className="text-2xl font-mono font-black text-stone-900 mt-1 block">
                    {loyaltyMembers.length}
                  </span>
                  <span className="text-[11px] text-stone-500">Clients fidélisés</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Points en Circulation
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-800 mt-1 block">
                    {loyaltyMembers.reduce((sum, m) => sum + (m.points || 0), 0)}
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium">Accumulés par les clients</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                    Membres Or & Platine VIP
                  </span>
                  <span className="text-2xl font-mono font-black text-purple-900 mt-1 block">
                    {loyaltyMembers.filter((m) => m.tier === 'platine' || m.tier === 'or').length}
                  </span>
                  <span className="text-[11px] text-purple-800 font-medium">Haut prestige</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Dépenses Cumulées
                  </span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-emerald-800 mt-1 block">
                    {formatXAF(loyaltyMembers.reduce((sum, m) => sum + (m.totalSpent || 0), 0))}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Volume généré</span>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, téléphone, rang..."
                      value={loyaltySearch}
                      onChange={(e) => setLoyaltySearch(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <span className="text-xs text-stone-500 font-semibold">
                    {filteredLoyaltyMembers.length} membre{filteredLoyaltyMembers.length > 1 ? 's' : ''} trouvé{filteredLoyaltyMembers.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Client</th>
                        <th className="p-3.5">Rang VIP</th>
                        <th className="p-3.5">Points Disponibles</th>
                        <th className="p-3.5">Commandes</th>
                        <th className="p-3.5">Total Dépensé</th>
                        <th className="p-3.5 text-right">Actions Direction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {filteredLoyaltyMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-500">
                            Aucun membre Club Prestige enregistré. Les clients reçoivent automatiquement leurs points dès leur première commande livrée !
                          </td>
                        </tr>
                      ) : (
                        filteredLoyaltyMembers.map((m) => {
                          const tierColors: Record<string, string> = {
                            platine: 'bg-purple-100 text-purple-900 border-purple-300',
                            or: 'bg-amber-100 text-amber-900 border-amber-300',
                            argent: 'bg-slate-200 text-slate-800 border-slate-300',
                            bronze: 'bg-orange-100 text-orange-900 border-orange-300',
                          };
                          return (
                            <tr key={m.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-stone-900">{m.name}</div>
                                <div className="text-[11px] text-stone-500 font-mono">{m.phone}</div>
                                {m.email && <div className="text-[10px] text-stone-400">{m.email}</div>}
                              </td>
                              <td className="p-3.5">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${tierColors[m.tier] || tierColors.bronze}`}>
                                  {m.tier}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-mono font-black text-amber-800 text-sm">
                                  {m.points} pts
                                </span>
                              </td>
                              <td className="p-3.5 font-mono">{m.ordersCount}</td>
                              <td className="p-3.5 font-mono font-bold text-emerald-800">
                                {formatXAF(m.totalSpent)}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => {
                                    setBonusMember(m);
                                    setBonusPoints(50);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] transition-colors"
                                >
                                  + Bonus Points
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LISTE BLANCHE VIP */}
          {activeTab === 'whitelist' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-2.5">
                    <UserCheck size={28} className="text-emerald-700" />
                    <span>Liste Blanche VIP (Whitelist Privilège)</span>
                  </h1>
                  <p className="text-xs text-stone-500">
                    Les clients inscrits sur la Liste Blanche bénéficient automatiquement de la livraison offerte dans toutes les régions (0 FCFA) et d'un rabais exclusif en caisse.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setWlName('');
                    setWlPhone('+237 6');
                    setWlEmail('');
                    setWlVipLevel('vip');
                    setWlDiscountPercent(10);
                    setWlFreeDelivery(true);
                    setWlNotes('');
                    setIsWhitelistModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Plus size={15} />
                  <span>Ajouter un Client VIP</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Clients Privilégiés
                  </span>
                  <span className="text-2xl font-mono font-black text-stone-900 mt-1 block">
                    {whitelist.length}
                  </span>
                  <span className="text-[11px] text-stone-500">Sur la Liste Blanche</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Livraison 0 FCFA Tout Cameroun
                  </span>
                  <span className="text-2xl font-mono font-black text-emerald-800 mt-1 block">
                    {whitelist.filter((w) => w.freeDeliveryAllRegions).length}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Bénéficiaires actifs</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Remise VIP Moyenne
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-800 mt-1 block">
                    {whitelist.length > 0
                      ? Math.round(whitelist.reduce((sum, w) => sum + w.discountPercent, 0) / whitelist.length)
                      : 0}%
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium">Appliquée d'office</span>
                </div>
              </div>

              {/* Whitelist Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, téléphone, niveau..."
                      value={whitelistSearch}
                      onChange={(e) => setWhitelistSearch(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <span className="text-xs text-stone-500 font-semibold">
                    {filteredWhitelist.length} contact{filteredWhitelist.length > 1 ? 's' : ''} sur la liste
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Client d'Honneur</th>
                        <th className="p-3.5">Statut VIP</th>
                        <th className="p-3.5">Remise Automatique</th>
                        <th className="p-3.5">Livraison Offerte</th>
                        <th className="p-3.5">Notes Internes</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {filteredWhitelist.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-500">
                            Aucun contact sur la liste blanche pour l'instant. Cliquez sur "Ajouter un Client VIP" pour en inscrire un.
                          </td>
                        </tr>
                      ) : (
                        filteredWhitelist.map((w) => {
                          const levelBadges: Record<string, string> = {
                            direction: 'bg-purple-100 text-purple-900 border-purple-300 font-black',
                            ambassadeur: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
                            partenaire: 'bg-blue-100 text-blue-900 border-blue-300 font-black',
                            vip: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
                          };
                          return (
                            <tr key={w.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-stone-900">{w.name}</div>
                                <div className="text-[11px] text-stone-600 font-mono">{w.phone}</div>
                                {w.email && <div className="text-[10px] text-stone-400">{w.email}</div>}
                              </td>
                              <td className="p-3.5">
                                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${levelBadges[w.vipLevel] || levelBadges.vip}`}>
                                  {w.vipLevel}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  -{w.discountPercent}%
                                </span>
                              </td>
                              <td className="p-3.5">
                                {w.freeDeliveryAllRegions ? (
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                    0 FCFA (10 Régions)
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-stone-500 font-mono">Tarif standard</span>
                                )}
                              </td>
                              <td className="p-3.5 text-stone-600 max-w-xs truncate text-[11px]">
                                {w.notes || '—'}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => deleteWhitelistEntry(w.id)}
                                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Retirer de la Liste Blanche"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: STOCK ADJUSTMENT */}
      {stockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Ajustement Physique du Stock
            </h3>
            <p className="text-stone-600">
              Article : <strong>{stockModalItem.product.title.fr}</strong> ({stockModalItem.variant.size} • {stockModalItem.variant.color})
            </p>
            <p className="text-stone-500 font-mono">Stock Actuel : {stockModalItem.variant.stock} unités</p>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Variation de Stock (+ pour ajout, - pour retrait)</label>
              <input
                type="number"
                value={stockAdjustmentDelta}
                onChange={(e) => setStockAdjustmentDelta(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Motif de l’Ajustement (Journal d’Audit)</label>
              <select
                value={stockAdjustmentReason}
                onChange={(e) => setStockAdjustmentReason(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 cursor-pointer"
              >
                <option value="Réapprovisionnement atelier Douala">Réapprovisionnement atelier Douala</option>
                <option value="Correction comptage inventaire physique">Correction comptage inventaire physique</option>
                <option value="Retour client conforme">Retour client conforme</option>
                <option value="Article défectueux / endommagé">Article défectueux / endommagé</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStockModalItem(null)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApplyStockAdjustment}
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Valider l’Ajustement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateExpenseSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">Enregistrer une Dépense Comptable</h3>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Intitulé de la dépense *</label>
              <input
                type="text"
                required
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="Ex: Plein carburant motos livraisons"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Montant (FCFA) *</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Catégorie</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 cursor-pointer"
                >
                  <option value="delivery_fuel">Carburant Livreurs</option>
                  <option value="packaging">Emballages & Housses</option>
                  <option value="marketing">Publicité & Marketing</option>
                  <option value="rent">Loyer Showroom</option>
                  <option value="salaries">Rémunérations</option>
                  <option value="other">Autre Frais</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Notes / Justificatif</label>
              <textarea
                rows={2}
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                placeholder="Ex: Facture station Tradex Bonapriso"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Comptabiliser
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE COURIER */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateCourierSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Créer un Compte Livreur Autorisé
            </h3>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Nom et Prénom du Coursier *</label>
              <input
                type="text"
                required
                value={newCourierName}
                onChange={(e) => setNewCourierName(e.target.value)}
                placeholder="Ex: Samuel Eto'o"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Téléphone Principal *</label>
                <input
                  type="text"
                  required
                  value={newCourierPhone}
                  onChange={(e) => setNewCourierPhone(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Code PIN Secret (4 Chiffres) *</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={newCourierPin}
                  onChange={(e) => setNewCourierPin(e.target.value)}
                  placeholder="Ex: 2025"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Secteur / Zone</label>
                <input
                  type="text"
                  value={newCourierZone}
                  onChange={(e) => setNewCourierZone(e.target.value)}
                  placeholder="Ex: Douala Akwa"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Véhicule</label>
                <input
                  type="text"
                  value={newCourierVehicle}
                  onChange={(e) => setNewCourierVehicle(e.target.value)}
                  placeholder="Ex: Moto Yamaha 125"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCourierModalOpen(false)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Générer les Accès
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ASSIGN COURIER TO ORDER */}
      {assigningCourierOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Assigner un Coursier à la Commande {assigningCourierOrder.orderNumber}
            </h3>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Sélectionner le Coursier Actif</label>
              <select
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 cursor-pointer font-medium"
              >
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone} - {c.zone})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningCourierOrder(null)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmCourierAssignment}
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Confirmer l’Assignation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COURIER CASH HANDOVER / RECONCILIATION */}
      {selectedReconcileCourier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Banknote size={20} />
                <h3 className="font-serif">Clôture & Versement d’Espèces Livreur</h3>
              </div>
              <button
                onClick={() => setSelectedReconcileCourier(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1.5 text-stone-700">
              <p><strong>Livreur :</strong> {selectedReconcileCourier.name} ({selectedReconcileCourier.phone})</p>
              <p><strong>Secteur d'activité :</strong> {selectedReconcileCourier.zone}</p>
              <p><strong>Espèces Collectées en Main Propre :</strong> <span className="font-mono font-black text-emerald-700 text-sm">{formatXAF(selectedReconcileCourier.currentCashCollected)}</span></p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Montant Reçu et Vérifié au Coffre Showroom (FCFA)
              </label>
              <input
                type="number"
                value={reconcileAmount}
                onChange={(e) => setReconcileAmount(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Motif / Destination de Caisse
              </label>
              <input
                type="text"
                value={reconcileNotes}
                onChange={(e) => setReconcileNotes(e.target.value)}
                placeholder="Ex: Clôture tournée Akwa - Dépôt en caisse centrale"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              ℹ️ La validation enregistrera une écriture comptable d'entrée de caisse, remettra à zéro le solde en main propre du coursier et inscrira un log dans le journal d'audit immuable.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReconcileCourier(null)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  reconcileCourierCash(selectedReconcileCourier.id, reconcileAmount, reconcileNotes);
                  setSelectedReconcileCourier(null);
                }}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Valider le Versement ({formatXAF(reconcileAmount)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVOICE PRINT */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="font-serif font-extrabold text-lg text-stone-900">KAMERCHIC CAMEROUN</span>
              <button onClick={() => setSelectedOrderForInvoice(null)} className="p-1">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-1 text-stone-700">
              <p><strong>N° Commande :</strong> {selectedOrderForInvoice.orderNumber}</p>
              <p><strong>Destinataire :</strong> {selectedOrderForInvoice.customerName} ({selectedOrderForInvoice.customerPhone})</p>
              <p><strong>Lieu de livraison :</strong> {selectedOrderForInvoice.deliveryAddress.city} - {selectedOrderForInvoice.deliveryAddress.quartier}</p>
              <p><strong>Repère :</strong> "{selectedOrderForInvoice.deliveryAddress.landmark}"</p>
              <p><strong>Mode Paiement :</strong> {selectedOrderForInvoice.paymentMethod.toUpperCase()} ({selectedOrderForInvoice.paymentStatus})</p>
            </div>

            <div className="border-t border-stone-200 pt-3 text-xs">
              <h4 className="font-bold mb-2">Détail des Articles :</h4>
              <ul className="space-y-1">
                {selectedOrderForInvoice.items.map((it) => (
                  <li key={it.cartItemId} className="flex justify-between">
                    <span>{it.product.title.fr} ({it.selectedSize}) x{it.quantity}</span>
                    <span className="font-mono font-bold">{formatXAF(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm">
              <span>Montant Total :</span>
              <span className="font-mono text-amber-900">{formatXAF(selectedOrderForInvoice.total)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Imprimer Facture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingProduct ? 'Modifier l’Article' : 'Ajouter un Nouvel Article'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nom du Produit (Français) *</label>
                  <input
                    type="text"
                    required
                    value={formTitleFr}
                    onChange={(e) => setFormTitleFr(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nom du Produit (Anglais)</label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prix de Vente (FCFA) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Coût d'Achat COGS (FCFA)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <option value="men">Hommes</option>
                    <option value="women">Femmes</option>
                    <option value="shoes">Chaussures</option>
                    <option value="watches">Montres</option>
                    <option value="perfumes">Parfums</option>
                    <option value="accessories">Accessoires</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Genre</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 cursor-pointer"
                  >
                    <option value="men">Hommes</option>
                    <option value="women">Femmes</option>
                    <option value="unisex">Unisexe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Marque</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL de l’Image</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="text-amber-900 font-semibold">Générer les descriptions bilingues avec Gemini AI</span>
                <button
                  type="button"
                  onClick={handleGenerateAiDescription}
                  disabled={isGeneratingAi}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>{isGeneratingAi ? 'Génération...' : 'Générer via IA'}</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description (Français)</label>
                <textarea
                  rows={3}
                  value={formDescFr}
                  onChange={(e) => setFormDescFr(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-300 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-stone-900 text-white font-bold"
                >
                  {editingProduct ? 'Enregistrer les Modifications' : 'Créer le Produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      {/* MODAL: ADD WHITELIST VIP */}
      {isWhitelistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddWhitelistSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                <UserCheck size={20} className="text-emerald-700" />
                <h3 className="font-serif">Inscrire un Client sur la Liste Blanche VIP</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWhitelistModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Nom & Prénom *</label>
              <input
                type="text"
                required
                value={wlName}
                onChange={(e) => setWlName(e.target.value)}
                placeholder="Ex: Hon. Charles Ndongo"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Téléphone Principal *</label>
                <input
                  type="text"
                  required
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email (Optionnel)</label>
                <input
                  type="email"
                  value={wlEmail}
                  onChange={(e) => setWlEmail(e.target.value)}
                  placeholder="contact@vip.cm"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Rang / Statut VIP</label>
                <select
                  value={wlVipLevel}
                  onChange={(e) => setWlVipLevel(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 cursor-pointer font-bold text-stone-800"
                >
                  <option value="vip">VIP</option>
                  <option value="ambassadeur">Ambassadeur</option>
                  <option value="direction">Direction</option>
                  <option value="partenaire">Partenaire</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Remise Automatique (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={wlDiscountPercent}
                  onChange={(e) => setWlDiscountPercent(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950 block">Livraison Offerte (0 FCFA)</span>
                <span className="text-[10px] text-emerald-800">Gratuité totale dans les 10 régions du Cameroun</span>
              </div>
              <input
                type="checkbox"
                checked={wlFreeDelivery}
                onChange={(e) => setWlFreeDelivery(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-emerald-300"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Notes Internes</label>
              <input
                type="text"
                value={wlNotes}
                onChange={(e) => setWlNotes(e.target.value)}
                placeholder="Ex: Partenaire officiel gala Yaoundé"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsWhitelistModalOpen(false)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Inscrire sur la Whitelist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: BONUS POINTS FOR LOYALTY MEMBER */}
      {bonusMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <Crown size={20} className="text-amber-600" />
                <h3 className="font-serif">Attribuer des Points Bonus Club Prestige</h3>
              </div>
              <button
                onClick={() => setBonusMember(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-stone-700 space-y-1">
              <p><strong>Bénéficiaire :</strong> {bonusMember.name} ({bonusMember.phone})</p>
              <p><strong>Solde Actuel :</strong> <span className="font-mono font-bold text-amber-800">{bonusMember.points} points</span> (Rang {bonusMember.tier.toUpperCase()})</p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Nombre de Points Bonus à Créditer</label>
              <input
                type="number"
                min={1}
                value={bonusPoints}
                onChange={(e) => setBonusPoints(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono font-bold text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Motif (Journal de Traçabilité)</label>
              <input
                type="text"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
                placeholder="Ex: Geste commercial ou anniversaire"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setBonusMember(null)}
                className="px-4 py-2 rounded-full border border-stone-300 font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApplyBonusPoints}
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold"
              >
                Créditer les Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

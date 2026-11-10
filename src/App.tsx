import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryTiles } from './components/CategoryTiles';
import { FlashSaleSection } from './components/FlashSaleSection';
import { CatalogView } from './components/CatalogView';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { GeminiShoppingAssistant } from './components/GeminiShoppingAssistant';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginGate } from './components/admin/AdminLoginGate';
import { DeliveryAgentPortal } from './components/delivery/DeliveryAgentPortal';
import { DeliveryLoginGate } from './components/delivery/DeliveryLoginGate';

function AppContent() {
  const { activePortal, adminSession, courierSession } = useStore();

  // SECURE GATE: Admin Portal is strictly protected by JWT & Google Authenticator 2FA
  if (activePortal === 'admin') {
    if (!adminSession) {
      return <AdminLoginGate />;
    }
    return <AdminPortal />;
  }

  // SECURE GATE: Courier Portal is strictly protected by Phone + Admin-generated PIN
  if (activePortal === 'delivery') {
    if (!courierSession) {
      return <DeliveryLoginGate />;
    }
    return <DeliveryAgentPortal />;
  }

  // PUBLIC FACING: Client Storefront (100% visible to customers, zero admin controls exposed)
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1a1a1a] selection:bg-amber-200 selection:text-amber-900">
      <Header />
      <main className="flex-1">
        <HeroBanner />
        <CategoryTiles />
        <FlashSaleSection />
        <CatalogView />
      </main>
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <SizeGuideModal />
      <LoyaltyModal />
      <WhatsAppFloatingButton />
      <GeminiShoppingAssistant />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

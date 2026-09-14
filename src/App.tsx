import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { LandingPage } from '@/components/LandingPage';

// Farmer Portal
import { FarmerDashboard } from '@/pages/farmer/FarmerDashboard';
import { FarmerCrops } from '@/pages/farmer/FarmerCrops';
import { FarmerAIInsights } from '@/pages/farmer/FarmerAIInsights';
import { FarmerProcurementCentres } from '@/pages/farmer/FarmerProcurementCentres';
import { FarmerBookSlot } from '@/pages/farmer/FarmerBookSlot';
import { FarmerQueue } from '@/pages/farmer/FarmerQueue';
import { FarmerProduce } from '@/pages/farmer/FarmerProduce';
import { FarmerBuyers } from '@/pages/farmer/FarmerBuyers';
import { FarmerOrders } from '@/pages/farmer/FarmerOrders';
import { FarmerPayments } from '@/pages/farmer/FarmerPayments';
import { FarmerNotifications } from '@/pages/farmer/FarmerNotifications';
import { FarmerProfile } from '@/pages/farmer/FarmerProfile';

// Centre Portal
import { CentreDashboard } from '@/pages/centre/CentreDashboard';
import { CentreQueue } from '@/pages/centre/CentreQueue';
import { CentreSlots } from '@/pages/centre/CentreSlots';
import { CentreFarmers } from '@/pages/centre/CentreFarmers';
import { CentreProcurement } from '@/pages/centre/CentreProcurement';
import { CentrePayments } from '@/pages/centre/CentrePayments';
import { CentreAnalytics } from '@/pages/centre/CentreAnalytics';
import { CentreAlerts } from '@/pages/centre/CentreAlerts';

// Buyer Portal
import { BuyerDashboard } from '@/pages/buyer/BuyerDashboard';
import { BuyerMarketplace } from '@/pages/buyer/BuyerMarketplace';
import { BuyerAIMatches } from '@/pages/buyer/BuyerAIMatches';
import { BuyerOrders } from '@/pages/buyer/BuyerOrders';
import { BuyerDeliveries } from '@/pages/buyer/BuyerDeliveries';
import { BuyerFarmers } from '@/pages/buyer/BuyerFarmers';
import { BuyerBPPDiscovery } from '@/pages/buyer/BuyerBPPDiscovery';
import { BuyerProfile } from '@/pages/buyer/BuyerProfile';

// Admin Portal
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminMap } from '@/pages/admin/AdminMap';
import { AdminCentres } from '@/pages/admin/AdminCentres';
import { AdminSupplyDemand } from '@/pages/admin/AdminSupplyDemand';
import { AdminAlerts } from '@/pages/admin/AdminAlerts';
import { AdminFarmers } from '@/pages/admin/AdminFarmers';
import { AdminBuyers } from '@/pages/admin/AdminBuyers';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminAIRecommendations } from '@/pages/admin/AdminAIRecommendations';
import { AdminBeckn } from '@/pages/admin/AdminBeckn';
import { SIHDemoMode } from '@/pages/demo/SIHDemoMode';
import { DemoFloatingDock } from '@/components/demo/DemoFloatingDock';

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sih-demo" element={<SIHDemoMode />} />

        {/* Farmer Portal */}
      <Route path="/farmer" element={<PortalLayout role="farmer" />}>
        <Route index element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="dashboard" element={<FarmerDashboard />} />
        <Route path="crops" element={<FarmerCrops />} />
        <Route path="ai-insights" element={<FarmerAIInsights />} />
        <Route path="procurement-centres" element={<FarmerProcurementCentres />} />
        <Route path="book-slot" element={<FarmerBookSlot />} />
        <Route path="queue" element={<FarmerQueue />} />
        <Route path="produce" element={<FarmerProduce />} />
        <Route path="buyers" element={<FarmerBuyers />} />
        <Route path="orders" element={<FarmerOrders />} />
        <Route path="payments" element={<FarmerPayments />} />
        <Route path="notifications" element={<FarmerNotifications />} />
        <Route path="profile" element={<FarmerProfile />} />
      </Route>

      {/* Centre Portal */}
      <Route path="/centre" element={<PortalLayout role="centre" />}>
        <Route index element={<Navigate to="/centre/dashboard" replace />} />
        <Route path="dashboard" element={<CentreDashboard />} />
        <Route path="queue" element={<CentreQueue />} />
        <Route path="slots" element={<CentreSlots />} />
        <Route path="farmers" element={<CentreFarmers />} />
        <Route path="procurement" element={<CentreProcurement />} />
        <Route path="payments" element={<CentrePayments />} />
        <Route path="analytics" element={<CentreAnalytics />} />
        <Route path="alerts" element={<CentreAlerts />} />
      </Route>

      {/* Buyer Portal */}
      <Route path="/buyer" element={<PortalLayout role="buyer" />}>
        <Route index element={<Navigate to="/buyer/dashboard" replace />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="marketplace" element={<BuyerMarketplace />} />
        <Route path="ai-matches" element={<BuyerAIMatches />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="deliveries" element={<BuyerDeliveries />} />
        <Route path="farmers" element={<BuyerFarmers />} />
        <Route path="bpp-discovery" element={<BuyerBPPDiscovery />} />
        <Route path="profile" element={<BuyerProfile />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/admin" element={<PortalLayout role="admin" />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="map" element={<AdminMap />} />
        <Route path="centres" element={<AdminCentres />} />
        <Route path="supply-demand" element={<AdminSupplyDemand />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="farmers" element={<AdminFarmers />} />
        <Route path="buyers" element={<AdminBuyers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="ai-recommendations" element={<AdminAIRecommendations />} />
        <Route path="beckn" element={<AdminBeckn />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <DemoFloatingDock />
  </>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

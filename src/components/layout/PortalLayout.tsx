import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Sprout, LayoutDashboard, Wheat, Sparkles, MapPin, CalendarClock,
  ListOrdered, Package, Users, ShoppingCart, Wallet, Bell, User,
  Store, CalendarDays, BarChart3, AlertTriangle,
  ShoppingBag, Truck, Globe, LogOut, Menu, Network,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ToastContainer } from '@/components/ui/Toast';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const navConfig: Record<Role, { title: string; items: NavItem[] }> = {
  farmer: {
    title: 'Farmer Portal',
    items: [
      { to: '/farmer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
      { to: '/farmer/crops', label: 'My Crops', icon: <Wheat className="w-[18px] h-[18px]" /> },
      { to: '/farmer/ai-insights', label: 'AI Insights', icon: <Sparkles className="w-[18px] h-[18px]" /> },
      { to: '/farmer/procurement-centres', label: 'Procurement Centres', icon: <MapPin className="w-[18px] h-[18px]" /> },
      { to: '/farmer/book-slot', label: 'Book Smart Slot', icon: <CalendarClock className="w-[18px] h-[18px]" /> },
      { to: '/farmer/queue', label: 'Live Queue', icon: <ListOrdered className="w-[18px] h-[18px]" /> },
      { to: '/farmer/produce', label: 'My Produce', icon: <Package className="w-[18px] h-[18px]" /> },
      { to: '/farmer/buyers', label: 'Buyers', icon: <Users className="w-[18px] h-[18px]" /> },
      { to: '/farmer/orders', label: 'Orders', icon: <ShoppingCart className="w-[18px] h-[18px]" /> },
      { to: '/farmer/payments', label: 'Payments', icon: <Wallet className="w-[18px] h-[18px]" /> },
      { to: '/farmer/notifications', label: 'Notifications', icon: <Bell className="w-[18px] h-[18px]" /> },
      { to: '/farmer/profile', label: 'Profile', icon: <User className="w-[18px] h-[18px]" /> },
    ],
  },
  centre: {
    title: 'Procurement Centre',
    items: [
      { to: '/centre/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
      { to: '/centre/queue', label: 'Live Queue', icon: <ListOrdered className="w-[18px] h-[18px]" /> },
      { to: '/centre/slots', label: 'Slot Management', icon: <CalendarDays className="w-[18px] h-[18px]" /> },
      { to: '/centre/farmers', label: 'Farmers', icon: <Users className="w-[18px] h-[18px]" /> },
      { to: '/centre/procurement', label: 'Procurement', icon: <Package className="w-[18px] h-[18px]" /> },
      { to: '/centre/payments', label: 'Payments', icon: <Wallet className="w-[18px] h-[18px]" /> },
      { to: '/centre/analytics', label: 'Analytics', icon: <BarChart3 className="w-[18px] h-[18px]" /> },
      { to: '/centre/alerts', label: 'Alerts', icon: <AlertTriangle className="w-[18px] h-[18px]" /> },
    ],
  },
  buyer: {
    title: 'Buyer Portal',
    items: [
      { to: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
      { to: '/buyer/marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-[18px] h-[18px]" /> },
      { to: '/buyer/ai-matches', label: 'AI Matches', icon: <Sparkles className="w-[18px] h-[18px]" /> },
      { to: '/buyer/orders', label: 'Orders', icon: <ShoppingCart className="w-[18px] h-[18px]" /> },
      { to: '/buyer/deliveries', label: 'Deliveries', icon: <Truck className="w-[18px] h-[18px]" /> },
      { to: '/buyer/farmers', label: 'Farmer Clusters', icon: <Users className="w-[18px] h-[18px]" /> },
      { to: '/buyer/bpp-discovery', label: 'Discover via BPP', icon: <Network className="w-[18px] h-[18px]" /> },
      { to: '/buyer/profile', label: 'Profile', icon: <User className="w-[18px] h-[18px]" /> },
    ],
  },
  admin: {
    title: 'Admin Command Centre',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
      { to: '/admin/map', label: 'Regional Map', icon: <Globe className="w-[18px] h-[18px]" /> },
      { to: '/admin/centres', label: 'Centres', icon: <Store className="w-[18px] h-[18px]" /> },
      { to: '/admin/supply-demand', label: 'Supply & Demand', icon: <BarChart3 className="w-[18px] h-[18px]" /> },
      { to: '/admin/alerts', label: 'AI Alerts', icon: <AlertTriangle className="w-[18px] h-[18px]" /> },
      { to: '/admin/farmers', label: 'Farmers', icon: <Sprout className="w-[18px] h-[18px]" /> },
      { to: '/admin/buyers', label: 'Buyers', icon: <Users className="w-[18px] h-[18px]" /> },
      { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-[18px] h-[18px]" /> },
      { to: '/admin/ai-recommendations', label: 'AI Recommendations', icon: <Sparkles className="w-[18px] h-[18px]" /> },
      { to: '/admin/beckn', label: 'Beckn BPP', icon: <Network className="w-[18px] h-[18px]" /> },
    ],
  },
};

const roleColors: Record<Role, string> = {
  farmer: 'bg-agri-600',
  centre: 'bg-blue-600',
  buyer: 'bg-amber-600',
  admin: 'bg-earth-800',
};

const roleIcons: Record<Role, ReactNode> = {
  farmer: <Sprout className="w-5 h-5" />,
  centre: <Store className="w-5 h-5" />,
  buyer: <ShoppingBag className="w-5 h-5" />,
  admin: <Globe className="w-5 h-5" />,
};

export function PortalLayout({ role }: { role: Role }) {
  const { setRole, notifications } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = navConfig[role];
  const unreadCount = notifications.filter((n) => n.role === role && !n.read).length;

  const handleLogout = () => {
    setRole('farmer');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-earth-200 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent role={role} config={config} unreadCount={unreadCount} onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-earth-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white border-r border-earth-200 flex flex-col animate-slide-in">
            <SidebarContent role={role} config={config} unreadCount={unreadCount} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-earth-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-earth-100 text-earth-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${roleColors[role]} text-white flex items-center justify-center`}>
                {roleIcons[role]}
              </div>
              <span className="font-semibold text-earth-900 text-sm hidden sm:block">{config.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(role === 'farmer' ? '/farmer/notifications' : role === 'centre' ? '/centre/alerts' : role === 'buyer' ? '/buyer/dashboard' : '/admin/alerts')}
              className="relative p-2 rounded-lg hover:bg-earth-100 text-earth-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/sih-demo')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition-colors"
              id="sih-demo-header-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">SIH DEMO MODE</span>
              <span className="sm:hidden">DEMO</span>
            </button>
            <button onClick={handleLogout} className="btn-ghost !px-3">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

function SidebarContent({
  role,
  config,
  unreadCount,
  onLogout,
  onNavigate,
}: {
  role: Role;
  config: { title: string; items: NavItem[] };
  unreadCount: number;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-earth-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-sm">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-earth-900 font-display leading-tight">AgriFlow AI</p>
            <p className="text-[10px] text-earth-500 uppercase tracking-wider">Predict. Procure. Move. Sell.</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {config.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-earth-100 space-y-1.5">
        <NavLink
          to="/sih-demo"
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-agri-50 hover:bg-agri-100 text-agri-800 font-semibold text-xs border border-agri-200 transition-colors"
          id="sih-demo-sidebar-link"
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>SIH Demo Mode (5-Min)</span>
        </NavLink>
        <button onClick={onLogout} className="sidebar-link w-full text-earth-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="w-[18px] h-[18px]" />
          <span>Switch Portal</span>
        </button>
      </div>
    </>
  );
}

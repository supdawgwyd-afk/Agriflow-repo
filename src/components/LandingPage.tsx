import { useNavigate } from 'react-router-dom';
import { Sprout, Store, ShoppingBag, Globe, ArrowRight, Sparkles, TrendingUp, Truck, Wheat } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';

const portals: {
  role: Role;
  title: string;
  description: string;
  icon: typeof Sprout;
  color: string;
  bgColor: string;
  features: string[];
}[] = [
  {
    role: 'farmer',
    title: 'Farmer Portal',
    description: 'AI-powered insights, smart slot booking, and real-time queue tracking for farmers.',
    icon: Sprout,
    color: 'text-agri-600',
    bgColor: 'from-agri-500 to-agri-700',
    features: ['AI Demand Forecasting', 'Smart Slot Booking', 'Live Queue Tracking', 'Payment Tracking'],
  },
  {
    role: 'centre',
    title: 'Procurement Centre',
    description: 'Operations dashboard with queue management, slot control, and analytics.',
    icon: Store,
    color: 'text-blue-600',
    bgColor: 'from-blue-500 to-blue-700',
    features: ['Live Queue Management', 'Slot Management', 'Arrival Forecasting', 'Procurement Workflow'],
  },
  {
    role: 'buyer',
    title: 'Buyer Portal',
    description: 'Marketplace with AI farmer matching, cluster sourcing, and delivery tracking.',
    icon: ShoppingBag,
    color: 'text-amber-600',
    bgColor: 'from-amber-500 to-amber-700',
    features: ['AI Farmer Matching', 'Marketplace', 'Farmer Clusters', 'Route Optimization'],
  },
  {
    role: 'admin',
    title: 'Admin Command Centre',
    description: 'Government-grade command centre with regional map, alerts, and AI recommendations.',
    icon: Globe,
    color: 'text-earth-700',
    bgColor: 'from-earth-700 to-earth-900',
    features: ['Regional Map View', 'AI Alerts & Recommendations', 'Supply-Demand Analysis', 'System-wide Analytics'],
  },
];

export function LandingPage() {
  const { setRole } = useApp();
  const navigate = useNavigate();

  const handleSelect = (role: Role) => {
    setRole(role);
    const routes: Record<Role, string> = {
      farmer: '/farmer/dashboard',
      centre: '/centre/dashboard',
      buyer: '/buyer/dashboard',
      admin: '/admin/dashboard',
    };
    navigate(routes[role]);
  };

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-agri-700 via-agri-600 to-agri-800 text-white">
        <div className="absolute inset-0 map-grid-dark opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-agri-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-agri-300/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Sprout className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold font-display">AgriFlow AI</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-agri-200" />
            <span>SIH 2026 Prototype</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-display leading-tight max-w-3xl">
            Predict. Procure.<br />Move. Sell.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-agri-100 max-w-2xl">
            AI-powered agricultural supply-chain and procurement platform connecting farmers,
            procurement centres, buyers, and government administration.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/sih-demo')}
              className="px-6 py-3.5 rounded-xl bg-white text-agri-900 font-bold text-sm shadow-lg hover:bg-agri-50 transition-all flex items-center gap-2 group hover:scale-105"
              id="launch-sih-demo-hero-btn"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Launch SIH 2026 Demo Mode (5-Min Judge Walkthrough)</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-agri-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>AI Demand Forecasting</span>
            </div>
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5" />
              <span>Smart Procurement</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span>Route Optimization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Selection */}
      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        {/* Judge Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-agri-50 via-amber-50 to-agri-50 border border-agri-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-agri-600 text-white flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-agri-700">SIH 2026 EVALUATION FLOW</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">Recommended</span>
              </div>
              <h3 className="text-base font-bold text-earth-900 mt-0.5">Explore the Unified 12-Stage Scenario</h3>
              <p className="text-xs text-earth-600 mt-0.5">
                Experience the complete live pipeline: Farmer Senthil Kumar (F01) → AI Forecast → Centre B → Dynamic Queue → ABC Foods Matching → Route DLV01 → Beckn BPP.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/sih-demo')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            id="sih-demo-banner-btn"
          >
            <span>Launch SIH Demo</span>
            <span className="text-amber-300 font-bold">→</span>
          </button>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-earth-900 font-display">Select Your Portal</h2>
          <p className="text-earth-500 mt-2">Choose a role to explore the platform</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.role}
                onClick={() => handleSelect(portal.role)}
                className="group text-left card card-hover p-6 hover:border-agri-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.bgColor} text-white flex items-center justify-center shadow-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-earth-900 font-display flex items-center gap-2">
                      {portal.title}
                      <ArrowRight className="w-4 h-4 text-earth-300 group-hover:text-agri-600 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-sm text-earth-500 mt-1">{portal.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {portal.features.map((f) => (
                        <span key={f} className="text-xs px-2 py-1 rounded-lg bg-earth-100 text-earth-600 font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Registered Farmers', value: '12,482' },
            { label: 'Procurement Centres', value: '37' },
            { label: 'Active Buyers', value: '428' },
            { label: 'Today\'s Produce', value: '482 t' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-agri-700 font-display">{stat.value}</p>
              <p className="text-xs text-earth-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

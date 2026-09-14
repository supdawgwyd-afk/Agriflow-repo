import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { AIInsightCard, AIRecommendationRow, ConfidenceIndicator } from '@/components/ui/AIInsightCard';
import { PageHeader, SectionHeader } from '@/components/ui/PageHeader';
import { NotificationItem } from '@/components/ui/Notification';
import { useApp } from '@/context/AppContext';
import {
  Sprout, Wheat, Wallet, CalendarClock, Sparkles, TrendingUp, TrendingDown,
  Clock, MapPin, ArrowRight, Package, Bell, IndianRupee,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { weeklyDemandData, priceTrendData } from '@/data/mockData';

export function FarmerDashboard() {
  const { currentFarmer, crops, bookings, payments, notifications } = useApp();
  const navigate = useNavigate();
  const farmerNotifications = notifications.filter((n) => n.role === 'farmer').slice(0, 4);
  const currentBooking = bookings[bookings.length - 1];
  const completedPayments = payments.filter((p) => p.status === 'Completed');
  const pendingPayments = payments.filter((p) => p.status === 'Pending');
  const readyCrops = crops.filter((c) => c.status === 'ready');
  const totalProduce = crops.reduce((sum, c) => sum + c.quantityKg, 0);

  return (
    <div>
      <PageHeader
        title={`Namaste, ${currentFarmer.name}`}
        subtitle={`${currentFarmer.village}, ${currentFarmer.district} • ${currentFarmer.landAcres} acres`}
        icon={<Sprout className="w-5 h-5" />}
        action={
          <button onClick={() => navigate('/farmer/book-slot')} className="btn-primary">
            <CalendarClock className="w-4 h-4" />
            Book Smart Slot
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Produce" value={`${totalProduce} kg`} icon={<Package className="w-5 h-5" />} color="agri" trend={{ value: '+12% vs last season', direction: 'up' }} />
        <KPICard label="Upcoming Harvest" value={`${readyCrops.length} crops`} icon={<Wheat className="w-5 h-5" />} color="amber" subtitle="Ready for procurement" />
        <KPICard label="Total Earnings" value={`₹${currentFarmer.totalEarnings.toLocaleString('en-IN')}`} icon={<Wallet className="w-5 h-5" />} color="agri" trend={{ value: '+18% this quarter', direction: 'up' }} />
        <KPICard label="Pending Payments" value={`₹${currentFarmer.pendingPayments.toLocaleString('en-IN')}`} icon={<IndianRupee className="w-5 h-5" />} color="red" subtitle={`${pendingPayments.length} pending transactions`} />
      </div>

      {/* AI Insight Card */}
      <div className="mb-6">
        <AIInsightCard
          title="AI Procurement Recommendation"
          badge="AI Prediction"
          reasoning="Based on predicted arrivals, processing capacity, and historical waiting times, Centre B at 2:00–2:30 PM is expected to have the lowest waiting time."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-xl p-4 border border-earth-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-earth-900">Tomatoes</p>
                  <p className="text-xs text-earth-500">800 kg • Harvest in 6 days</p>
                </div>
              </div>
              <div className="space-y-1">
                <AIRecommendationRow label="Demand Forecast" value="HIGH" icon={<TrendingUp className="w-3.5 h-3.5 text-green-600" />} />
                <AIRecommendationRow label="Demand Increase" value="+18%" icon={<TrendingUp className="w-3.5 h-3.5 text-green-600" />} />
                <AIRecommendationRow label="Recommended Price" value="₹29–₹32/kg" icon={<IndianRupee className="w-3.5 h-3.5" />} />
              </div>
            </div>

            <div className="bg-white/70 rounded-xl p-4 border border-earth-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-agri-50 text-agri-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-earth-900">Centre B — Karunya Nagar</p>
                  <p className="text-xs text-earth-500">AI Recommended Centre</p>
                </div>
              </div>
              <div className="space-y-1">
                <AIRecommendationRow label="Estimated Wait" value="21 minutes" icon={<Clock className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Recommended Slot" value="2:00–2:30 PM" icon={<CalendarClock className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Current Capacity" value="46%" icon={<Sparkles className="w-3.5 h-3.5" />} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-earth-200/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-500">Confidence:</span>
              <div className="w-32"><ConfidenceIndicator value={87} /></div>
            </div>
            <button onClick={() => navigate('/farmer/book-slot')} className="btn-primary">
              Book Smart Slot
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </AIInsightCard>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Weekly Demand Forecast" subtitle="Tomato demand vs supply (kg)" icon={<TrendingUp className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyDemandData}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="demand" stroke="#22c55e" strokeWidth={2} fill="url(#demandGrad)" name="Demand" />
                <Area type="monotone" dataKey="supply" stroke="#f59e0b" strokeWidth={2} fill="url(#supplyGrad)" name="Supply" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Crop Price Trends" subtitle="Price per kg over 8 weeks" icon={<TrendingDown className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="tomato" stroke="#ef4444" strokeWidth={2} name="Tomato" dot={false} />
                <Line type="monotone" dataKey="potato" stroke="#f59e0b" strokeWidth={2} name="Potato" dot={false} />
                <Line type="monotone" dataKey="onion" stroke="#8b5cf6" strokeWidth={2} name="Onion" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Current Booking & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Current Procurement Booking" icon={<CalendarClock className="w-5 h-5" />} />
          {currentBooking ? (
            <div className="p-5 pt-2">
              <div className="flex flex-wrap items-center gap-4 bg-agri-50 rounded-xl p-4 border border-agri-200">
                <div className="text-center">
                  <p className="text-xs text-earth-500 mb-1">Token</p>
                  <p className="text-2xl font-bold text-agri-700 font-display">{currentBooking.tokenNumber}</p>
                </div>
                <div className="h-12 w-px bg-agri-200" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-earth-900">{currentBooking.centreName}</p>
                  <p className="text-sm text-earth-500">{currentBooking.crop} • {currentBooking.quantityKg} kg</p>
                  <p className="text-sm text-earth-500">{currentBooking.slotTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-earth-500 mb-1">Est. Wait</p>
                  <p className="text-lg font-semibold text-earth-900">{currentBooking.estimatedWaitMin} min</p>
                </div>
                <button onClick={() => navigate('/farmer/queue')} className="btn-secondary">
                  Track Queue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 pt-2 text-center py-8 text-earth-400">
              <CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active booking. Book a smart slot to get started.</p>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent Notifications" icon={<Bell className="w-5 h-5" />} action={<button onClick={() => navigate('/farmer/notifications')} className="text-xs text-agri-600 hover:underline">View all</button>} />
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {farmerNotifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

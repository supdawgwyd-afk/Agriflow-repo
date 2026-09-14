import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { MapPanel } from '@/components/ui/MapPanel';
import { useApp } from '@/context/AppContext';
import { generateAdminAlerts } from '@/utils/aiSimulation';
import type { ProcurementCentre } from '@/types';
import {
  Globe, Users, Store, Package, IndianRupee, ShoppingBag,
  Clock, AlertTriangle, Sparkles, ArrowRight, TrendingUp,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  procurementVolumeData, cropDistributionData, incomeTrendData,
} from '@/data/mockData';

const alertColorMap = {
  danger: 'bg-red-50 text-red-600 border-red-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  success: 'bg-green-50 text-green-600 border-green-200',
};

const alertIconMap = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
};

export function AdminDashboard() {
  const { centres, farmers, buyers, produceListings, orders, payments } = useApp();
  const navigate = useNavigate();
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre | null>(null);

  const liveAlerts = generateAdminAlerts(centres, produceListings, buyers);
  const totalProcessed = centres.reduce((s, c) => s + c.processedTodayKg, 0);
  const totalQueue = centres.reduce((s, c) => s + c.queueCount, 0);
  const avgWait = Math.round(centres.reduce((s, c) => s + c.estimatedWaitMin, 0) / centres.length);
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="AgriFlow AI"
        subtitle="Agricultural Supply & Procurement Command Centre"
        icon={<Globe className="w-5 h-5" />}
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KPICard label="Registered Farmers" value={farmers.length.toString()} icon={<Users className="w-5 h-5" />} color="agri" trend={{ value: '+248 this month', direction: 'up' }} />
        <KPICard label="Procurement Centres" value={centres.length.toString()} icon={<Store className="w-5 h-5" />} color="blue" />
        <KPICard label="Today's Produce" value={`${(totalProcessed / 1000).toFixed(1)} t`} icon={<Package className="w-5 h-5" />} color="amber" trend={{ value: '+12% vs avg', direction: 'up' }} />
        <KPICard label="Total Payments" value={`₹${(totalPayments / 100000).toFixed(2)} L`} icon={<IndianRupee className="w-5 h-5" />} color="agri" trend={{ value: '+8% vs avg', direction: 'up' }} />
        <KPICard label="Active Buyers" value={buyers.length.toString()} icon={<ShoppingBag className="w-5 h-5" />} color="blue" />
        <KPICard label="Avg Wait Time" value={`${avgWait} min`} icon={<Clock className="w-5 h-5" />} color="agri" trend={{ value: '-67% with AI', direction: 'up' }} />
      </div>

      {/* Map + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Regional Map */}
        <Card className="lg:col-span-2 p-4">
          <CardHeader title="Regional Map" subtitle="Procurement centre status across districts" icon={<Globe className="w-5 h-5" />} action={<button onClick={() => navigate('/admin/map')} className="text-xs text-agri-600 hover:underline">View full map</button>} />
          <MapPanel centres={centres} selectedCentre={selectedCentre} onSelectCentre={setSelectedCentre} height="400px" />
          {selectedCentre && (
            <div className="mt-4 p-4 rounded-xl border border-earth-200 bg-earth-50/50">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-earth-900">{selectedCentre.name}</p>
                <StatusBadge status={selectedCentre.status} />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-sm">
                <div><p className="text-xs text-earth-500">Capacity</p><p className="font-semibold">{selectedCentre.capacityPct}%</p></div>
                <div><p className="text-xs text-earth-500">Queue</p><p className="font-semibold">{selectedCentre.queueCount}</p></div>
                <div><p className="text-xs text-earth-500">Wait</p><p className="font-semibold">{selectedCentre.estimatedWaitMin}m</p></div>
                <div><p className="text-xs text-earth-500">Farmers</p><p className="font-semibold">{selectedCentre.farmersToday}</p></div>
                <div><p className="text-xs text-earth-500">Processed</p><p className="font-semibold">{(selectedCentre.processedTodayKg / 1000).toFixed(1)}t</p></div>
                <div><p className="text-xs text-earth-500">Pending Pay</p><p className="font-semibold">{selectedCentre.pendingPaymentsCount}</p></div>
              </div>
            </div>
          )}
        </Card>

        {/* AI Alerts */}
        <div className="space-y-4">
          <Card className="p-4">
            <CardHeader title="AI Alerts" subtitle="System-wide predictions" icon={<AlertTriangle className="w-5 h-5" />} />
            <div className="space-y-3 mt-2">
              {liveAlerts.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-earth-500">No alerts. All systems normal.</p>
                </div>
              ) : (
                liveAlerts.slice(0, 5).map((alert, i) => {
                  const Icon = alertIconMap[alert.severity];
                  return (
                    <div key={i} className={`p-3 rounded-xl border ${alertColorMap[alert.severity]}`}>
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-earth-900">{alert.title}</p>
                          <p className="text-xs text-earth-600 mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button onClick={() => navigate('/admin/alerts')} className="text-xs text-agri-600 hover:underline mt-3">
              View all alerts <ArrowRight className="w-3 h-3 inline" />
            </button>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Procurement Volume" subtitle="Daily volume (tonnes)" icon={<Package className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={procurementVolumeData}>
                <defs>
                  <linearGradient id="adminVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} fill="url(#adminVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Crop Distribution" subtitle="By crop type" icon={<Package className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cropDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e: any) => `${e.value}%`}>
                  {cropDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Farmer Income Trends" subtitle="Before AI vs With AI (₹)" icon={<IndianRupee className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Bar dataKey="before" fill="#ef4444" name="Before AI" radius={[4, 4, 0, 0]} />
                <Bar dataKey="income" fill="#22c55e" name="With AI" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Centre Status Summary */}
      <Card className="mt-6">
        <CardHeader title="Centre Status Summary" subtitle={`${centres.length} centres • ${totalQueue} farmers in queue`} icon={<Store className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-earth-200">
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Centre</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">District</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Capacity</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Queue</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Wait</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Processed</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((c) => (
                <tr key={c.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                  <td className="px-4 py-3 text-sm font-medium text-earth-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-earth-700">{c.district}</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.capacityPct}%</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.queueCount}</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.estimatedWaitMin}m</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{(c.processedTodayKg / 1000).toFixed(1)}t</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

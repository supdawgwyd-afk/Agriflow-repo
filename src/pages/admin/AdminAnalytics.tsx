import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  BarChart3, TrendingUp, Clock, IndianRupee, Package, Truck,
  Shield, CheckCircle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  incomeTrendData, procurementVolumeData, centreUtilizationData,
  logisticsDistanceData, surplusPreventedData, buyerFulfillmentData,
  paymentProcessingData,
} from '@/data/mockData';

const comparisonCards = [
  { label: 'Average Waiting Time', before: '1h 42m', after: '34m', improvement: '67%', icon: Clock, color: 'text-agri-600' },
  { label: 'Farmer Income', before: '₹2.58L', after: '₹3.45L', improvement: '34%', icon: IndianRupee, color: 'text-agri-600' },
  { label: 'Logistics Distance', before: '55 km', after: '37 km', improvement: '33%', icon: Truck, color: 'text-blue-600' },
  { label: 'Surplus Prevented', before: '0 t', after: '6.3 t', improvement: '100%', icon: Package, color: 'text-amber-600' },
  { label: 'Buyer Fulfillment', before: '72%', after: '93%', improvement: '29%', icon: Shield, color: 'text-agri-600' },
  { label: 'Payment Completion', before: '78%', after: '94%', improvement: '21%', icon: CheckCircle, color: 'text-agri-600' },
];

export function AdminAnalytics() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="System-wide performance metrics and AI impact analysis"
        icon={<BarChart3 className="w-5 h-5" />}
      />

      {/* Before AI vs With AI */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-agri-600" />
          <h2 className="font-semibold text-earth-900">Before AI vs With AgriFlow AI</h2>
          <Badge variant="warning" className="ml-2">Prototype / Simulated Data</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {comparisonCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="p-4">
                <Icon className={`w-5 h-5 ${card.color} mb-2`} />
                <p className="text-xs text-earth-500 mb-2">{card.label}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-earth-400">Before:</span>
                    <span className="font-medium text-earth-600">{card.before}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-agri-600 font-medium">With AI:</span>
                    <span className="font-bold text-agri-700">{card.after}</span>
                  </div>
                  <div className="pt-1 mt-1 border-t border-earth-100">
                    <span className="text-xs font-semibold text-agri-600">↑ {card.improvement} improvement</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Farmer Income Trends" subtitle="Before AI vs With AI (₹)" icon={<IndianRupee className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="before" fill="#ef4444" name="Before AI" radius={[4, 4, 0, 0]} />
                <Bar dataKey="income" fill="#22c55e" name="With AI" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Procurement Volume" subtitle="Daily volume (tonnes)" icon={<Package className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={procurementVolumeData}>
                <defs>
                  <linearGradient id="aVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} fill="url(#aVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Centre Utilization" subtitle="Capacity usage (%)" icon={<TrendingUp className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centreUtilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#78716c' }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Logistics Distance" subtitle="Before AI vs With AI (km)" icon={<Truck className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logisticsDistanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="before" stroke="#ef4444" strokeWidth={2} name="Before AI" dot={false} />
                <Line type="monotone" dataKey="after" stroke="#22c55e" strokeWidth={2} name="With AI" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Surplus Prevented" subtitle="Tonnes saved from waste" icon={<Package className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={surplusPreventedData}>
                <defs>
                  <linearGradient id="sPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="tonnes" stroke="#f59e0b" strokeWidth={2} fill="url(#sPrev)" name="Surplus Prevented (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Buyer Fulfillment" subtitle="Order fulfillment rate (%)" icon={<Shield className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buyerFulfillmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Line type="monotone" dataKey="fulfillment" stroke="#22c55e" strokeWidth={2} name="Fulfillment %" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

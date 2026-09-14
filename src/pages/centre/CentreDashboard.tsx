import { Card, CardHeader } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { AIInsightCard, AIRecommendationRow } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { computeCongestionScore } from '@/utils/aiSimulation';
import {
  LayoutDashboard, Users, Clock, TrendingUp, Package,
  IndianRupee, AlertTriangle, Sparkles, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { arrivalForecastData, dailyFarmersData } from '@/data/mockData';

export function CentreDashboard() {
  const { centres, queueTokens } = useApp();
  const centre = centres[0];
  const congestion = computeCongestionScore(centre);
  const altCentre = centres.find((c) => c.id !== centre.id && c.capacityPct < 70);
  const centreTokens = queueTokens.filter((t) => t.centreId === centre.id);

  return (
    <div>
      <PageHeader
        title={centre.name}
        subtitle={`${centre.district} District • Operations Dashboard`}
        icon={<LayoutDashboard className="w-5 h-5" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KPICard label="Farmers Today" value={`${centre.farmersToday}`} icon={<Users className="w-5 h-5" />} color="agri" trend={{ value: '+8 vs yesterday', direction: 'up' }} />
        <KPICard label="Current Queue" value={`${centre.queueCount}`} icon={<Clock className="w-5 h-5" />} color="amber" />
        <KPICard label="Avg Wait Time" value={`${centre.estimatedWaitMin}m`} icon={<Clock className="w-5 h-5" />} color="red" />
        <KPICard label="Capacity" value={`${centre.capacityPct}%`} icon={<TrendingUp className="w-5 h-5" />} color={centre.capacityPct >= 75 ? 'red' : 'agri'} />
        <KPICard label="Processed Today" value={`${(centre.processedTodayKg / 1000).toFixed(1)}t`} icon={<Package className="w-5 h-5" />} color="agri" />
        <KPICard label="Pending Payments" value={`${centre.pendingPaymentsCount}`} icon={<IndianRupee className="w-5 h-5" />} color="amber" />
      </div>

      {/* AI Congestion Alert */}
      {congestion.shouldRedirect && altCentre ? (
        <div className="mb-6">
          <AIInsightCard
            title="AI Congestion Alert"
            badge="AI Simulation"
            variant="warning"
            reasoning={`${centre.name} is at ${centre.capacityPct}% capacity (congestion level: ${congestion.level}). Based on real-time arrival patterns and processing rate, congestion is predicted to worsen.`}
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">High Congestion Detected</p>
                  <p className="text-sm text-red-700 mt-1">
                    {centre.name} is at <strong>{centre.capacityPct}% capacity</strong> with {centre.queueCount} farmers in queue.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 bg-agri-50 border border-agri-200 rounded-xl p-4">
              <p className="text-sm font-medium text-agri-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Recommendation
              </p>
              <p className="text-sm text-earth-700 mb-3">Redirect incoming farmers to <strong>{altCentre.name}</strong> — {altCentre.district}.</p>
              <div className="space-y-1">
                <AIRecommendationRow label="Expected Wait Reduction" value={`${Math.round((1 - altCentre.capacityPct / centre.capacityPct) * 100)}%`} icon={<TrendingUp className="w-3.5 h-3.5 text-green-600" />} />
                <AIRecommendationRow label="Target Centre" value={altCentre.name} icon={<ArrowRight className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Target Capacity" value={`${altCentre.capacityPct}%`} icon={<TrendingUp className="w-3.5 h-3.5" />} />
              </div>
            </div>
          </AIInsightCard>
        </div>
      ) : (
        <div className="mb-6">
          <AIInsightCard
            title="AI Operations Status"
            badge="AI Simulation"
            reasoning={`${centre.name} is operating normally at ${centre.capacityPct}% capacity. No congestion warnings at this time. Queue length: ${centre.queueCount} farmers.`}
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">All Systems Normal</p>
                  <p className="text-sm text-green-700 mt-1">No congestion predicted. Processing rate is stable.</p>
                </div>
              </div>
            </div>
          </AIInsightCard>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Arrival Forecast" subtitle="Predicted farmer arrivals by hour (%)" icon={<TrendingUp className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={arrivalForecastData}>
                <defs>
                  <linearGradient id="arrivalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} fill="url(#arrivalGrad)" name="Predicted Arrival %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Daily Farmers" subtitle="Arrivals vs processed (this week)" icon={<Users className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyFarmersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Bar dataKey="farmers" fill="#3b82f6" name="Arrived" radius={[4, 4, 0, 0]} />
                <Bar dataKey="processed" fill="#22c55e" name="Processed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Queue Summary */}
      <Card className="mt-6">
        <CardHeader title="Queue Summary" subtitle={`${centreTokens.length} tokens today`} icon={<Clock className="w-5 h-5" />} />
        <div className="p-5 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-earth-50">
            <p className="text-2xl font-bold text-earth-900">{centreTokens.filter(t => t.stage === 'Waiting').length}</p>
            <p className="text-xs text-earth-500">Waiting</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-earth-50">
            <p className="text-2xl font-bold text-earth-900">{centreTokens.filter(t => t.stage === 'Weighing' || t.stage === 'Quality Check').length}</p>
            <p className="text-xs text-earth-500">Processing</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-earth-50">
            <p className="text-2xl font-bold text-agri-600">{centreTokens.filter(t => t.stage === 'Procured' || t.stage === 'Payment').length}</p>
            <p className="text-xs text-earth-500">Completed</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-earth-50">
            <p className="text-2xl font-bold text-amber-600">{centreTokens.filter(t => t.priority === 'Urgent').length}</p>
            <p className="text-xs text-earth-500">Urgent</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

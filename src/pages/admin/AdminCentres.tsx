import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { KPICard } from '@/components/ui/KPICard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { Store, Users, Clock, Package, IndianRupee, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { centreUtilizationData } from '@/data/mockData';

export function AdminCentres() {
  const { centres } = useApp();

  return (
    <div>
      <PageHeader
        title="Procurement Centres"
        subtitle="All centres across the system"
        icon={<Store className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Centres" value={`${centres.length}`} icon={<Store className="w-5 h-5" />} color="blue" />
        <KPICard label="Available" value={`${centres.filter(c => c.status === 'AVAILABLE').length}`} icon={<Store className="w-5 h-5" />} color="agri" />
        <KPICard label="Moderate" value={`${centres.filter(c => c.status === 'MODERATE').length}`} icon={<Store className="w-5 h-5" />} color="amber" />
        <KPICard label="High Load" value={`${centres.filter(c => c.status === 'HIGH LOAD').length}`} icon={<Store className="w-5 h-5" />} color="red" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Centre Utilization" subtitle="Capacity usage comparison" icon={<TrendingUp className="w-5 h-5" />} />
        <div className="p-5 pt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={centreUtilizationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#78716c' }} width={100} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
              <Bar dataKey="utilization" fill="#22c55e" name="Utilization %" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Centre Details" subtitle="Complete centre overview" icon={<Store className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-earth-200">
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Centre</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">District</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Capacity</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Queue</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Wait</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmers</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Processed</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Pending Pay</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((c) => (
                <tr key={c.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                  <td className="px-4 py-3 text-sm font-medium text-earth-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-earth-700">{c.district}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-earth-200 overflow-hidden">
                        <div className={`h-full rounded-full ${c.capacityPct > 85 ? 'bg-red-500' : c.capacityPct > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${c.capacityPct}%` }} />
                      </div>
                      <span className="font-medium">{c.capacityPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.queueCount}</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.estimatedWaitMin}m</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.farmersToday}</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{(c.processedTodayKg / 1000).toFixed(1)}t</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{c.pendingPaymentsCount}</td>
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

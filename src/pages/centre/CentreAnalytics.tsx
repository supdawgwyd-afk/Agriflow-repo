import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  BarChart3, Clock, TrendingUp, Package, IndianRupee,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from 'recharts';
import {
  dailyFarmersData, centreUtilizationData, cropDistributionData,
  procurementVolumeData, paymentProcessingData, waitTimeData,
} from '@/data/mockData';

export function CentreAnalytics() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Centre performance metrics and trends"
        icon={<BarChart3 className="w-5 h-5" />}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Daily Farmers" subtitle="Arrivals vs processed this week" icon={<TrendingUp className="w-5 h-5" />} />
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

        <Card>
          <CardHeader title="Waiting Time" subtitle="Before AI vs With AI (minutes)" icon={<Clock className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Bar dataKey="before" fill="#ef4444" name="Before AI" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="#22c55e" name="With AI" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Centre Utilization" subtitle="Capacity usage across centres" icon={<TrendingUp className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centreUtilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#78716c' }} width={80} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Bar dataKey="utilization" fill="#22c55e" name="Utilization %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Crop Distribution" subtitle="Procurement by crop type" icon={<Package className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cropDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                  {cropDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Procurement Volume" subtitle="Daily volume (tonnes)" icon={<Package className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={procurementVolumeData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} fill="url(#volGrad)" name="Volume (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Payment Processing" subtitle="Completion rate over time" icon={<IndianRupee className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentProcessingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Bar dataKey="completed" fill="#22c55e" name="Completed %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

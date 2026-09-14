import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { KPICard } from '@/components/ui/KPICard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  Wallet, IndianRupee, Clock, CheckCircle, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { paymentProcessingData } from '@/data/mockData';

export function FarmerPayments() {
  const { payments, currentFarmer } = useApp();
  const myPayments = payments.filter((p) => p.farmerId === currentFarmer.id || p.farmerId === 'F01');
  const totalEarnings = myPayments.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = myPayments.filter((p) => p.status !== 'Completed').reduce((s, p) => s + p.amount, 0);
  const completedCount = myPayments.filter((p) => p.status === 'Completed').length;
  const pendingCount = myPayments.filter((p) => p.status !== 'Completed').length;

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track your earnings and payment status"
        icon={<Wallet className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} icon={<IndianRupee className="w-5 h-5" />} color="agri" trend={{ value: '+18% this quarter', direction: 'up' }} />
        <KPICard label="Pending" value={`₹${pendingAmount.toLocaleString('en-IN')}`} icon={<Clock className="w-5 h-5" />} color="amber" subtitle={`${pendingCount} transactions`} />
        <KPICard label="Completed" value={`${completedCount}`} icon={<CheckCircle className="w-5 h-5" />} color="agri" subtitle="transactions" />
        <KPICard label="Avg. per Transaction" value={`₹${Math.round(totalEarnings / Math.max(1, completedCount)).toLocaleString('en-IN')}`} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader title="Payment Processing" subtitle="Completed vs pending (weekly %)" icon={<TrendingUp className="w-5 h-5" />} />
        <div className="p-5 pt-2 h-56">
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

      {/* Transaction History */}
      <Card>
        <CardHeader title="Transaction History" subtitle="All payment records" icon={<Wallet className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-earth-200">
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Transaction ID</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Centre</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Crop</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Quantity</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Method</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                  <td className="px-4 py-3 text-sm font-mono text-earth-700">{payment.transactionId}</td>
                  <td className="px-4 py-3 text-sm text-earth-700">{payment.centreName}</td>
                  <td className="px-4 py-3 text-sm text-earth-700">{payment.crop}</td>
                  <td className="px-4 py-3 text-sm text-right text-earth-700">{payment.quantityKg} kg</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-earth-900">₹{payment.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-earth-700">{payment.method}</td>
                  <td className="px-4 py-3 text-sm text-earth-700">{payment.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

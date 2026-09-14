import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { KPICard } from '@/components/ui/KPICard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  Wallet, IndianRupee, Clock, CheckCircle, Store,
} from 'lucide-react';

export function CentrePayments() {
  const { payments, centres, updatePaymentStatus } = useApp();
  const [selectedCentreId, setSelectedCentreId] = useState(centres[0].id);
  const centre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const centrePayments = payments.filter((p) => p.centreId === centre.id);
  const completed = centrePayments.filter((p) => p.status === 'Completed');
  const pending = centrePayments.filter((p) => p.status !== 'Completed');
  const totalPaid = completed.reduce((s, p) => s + p.amount, 0);
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Payment processing and records"
        icon={<Wallet className="w-5 h-5" />}
      />

      {/* Centre Selector */}
      <Card className="mb-6 p-4">
        <label className="label mb-2">Select Centre</label>
        <div className="flex flex-wrap gap-2">
          {centres.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCentreId(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCentreId === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 inline mr-1.5" />
              {c.name}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Paid" value={`₹${totalPaid.toLocaleString('en-IN')}`} icon={<IndianRupee className="w-5 h-5" />} color="agri" />
        <KPICard label="Pending" value={`₹${totalPending.toLocaleString('en-IN')}`} icon={<Clock className="w-5 h-5" />} color="amber" />
        <KPICard label="Completed" value={`${completed.length}`} icon={<CheckCircle className="w-5 h-5" />} color="agri" />
        <KPICard label="Pending Count" value={`${pending.length}`} icon={<Wallet className="w-5 h-5" />} color="blue" />
      </div>

      <Card>
        <CardHeader title={`${centre.name} Payment Records`} subtitle="All transactions at this centre" icon={<Wallet className="w-5 h-5" />} />
        {centrePayments.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto text-earth-300 mb-3" />
            <p className="text-earth-500">No payment records for {centre.name}. Payments are created automatically when procurement reaches the Payment stage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Transaction ID</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmer</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Crop</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Quantity</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Method</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {centrePayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                    <td className="px-4 py-3 text-sm font-mono text-earth-700">{payment.transactionId}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{payment.farmerName}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{payment.crop}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{payment.quantityKg} kg</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-earth-900">₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{payment.method}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{payment.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={payment.status} /></td>
                    <td className="px-4 py-3">
                      {payment.status !== 'Completed' ? (
                        <select
                          value={payment.status}
                          onChange={(e) => updatePaymentStatus(payment.id, e.target.value as 'Pending' | 'Processing' | 'Completed')}
                          className="text-xs border border-earth-300 rounded-lg px-2 py-1 bg-white text-earth-700 font-medium cursor-pointer hover:border-earth-400"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Completed">Mark Paid</option>
                        </select>
                      ) : (
                        <span className="text-xs text-agri-700 font-medium">Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

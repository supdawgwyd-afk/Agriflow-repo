import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  Users, Search, IndianRupee,
} from 'lucide-react';

export function CentreFarmers() {
  const { queueTokens, centres, payments } = useApp();
  const centre = centres[0];
  const [search, setSearch] = useState('');

  const centreTokens = queueTokens.filter((t) => t.centreId === centre.id);
  const filtered = centreTokens.filter((t) =>
    t.farmerName.toLowerCase().includes(search.toLowerCase()) ||
    t.crop.toLowerCase().includes(search.toLowerCase()) ||
    t.tokenNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Farmers"
        subtitle={`${centre.name} • Farmer records and status`}
        icon={<Users className="w-5 h-5" />}
      />

      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
          <input
            type="text"
            placeholder="Search by farmer name, crop, or token..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Farmer Records" subtitle={`${filtered.length} farmers`} icon={<Users className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-earth-200">
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Token</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Farmer</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Crop</th>
                <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Quantity</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Centre</th>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((token) => {
                const payment = payments.find((p) => p.farmerId === token.farmerId && p.crop === token.crop);
                return (
                  <tr key={token.id} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                    <td className="px-4 py-3"><span className="font-mono font-semibold text-earth-900">{token.tokenNumber}</span></td>
                    <td className="px-4 py-3 text-sm text-earth-700">{token.farmerName}</td>
                    <td className="px-4 py-3 text-sm text-earth-700">{token.crop}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{token.quantityKg} kg</td>
                    <td className="px-4 py-3"><StatusBadge status={token.stage} /></td>
                    <td className="px-4 py-3 text-sm text-earth-700">{centre.name.split('—')[0].trim()}</td>
                    <td className="px-4 py-3">
                      {payment ? <StatusBadge status={payment.status} /> : <Badge variant="neutral">Pending</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { computeSurplusRisk } from '@/utils/aiSimulation';
import type { CropType } from '@/types';
import {
  BarChart3, TrendingUp, TrendingDown, MapPin,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';

const districts = ['All Clusters', 'Karunya Nagar', 'Siruvani', 'Alandurai', 'Thondamuthur', 'Madampatti'];

const heatmapData = [
  { district: 'Karunya Nagar', tomato: 'surplus', rice: 'balanced', onion: 'surplus', potato: 'balanced', chilli: 'deficit' },
  { district: 'Siruvani', tomato: 'balanced', rice: 'surplus', onion: 'surplus', potato: 'deficit', chilli: 'balanced' },
  { district: 'Alandurai', tomato: 'deficit', rice: 'balanced', onion: 'balanced', potato: 'surplus', chilli: 'surplus' },
  { district: 'Thondamuthur', tomato: 'surplus', rice: 'deficit', onion: 'balanced', potato: 'balanced', chilli: 'surplus' },
  { district: 'Madampatti', tomato: 'surplus', rice: 'surplus', onion: 'deficit', potato: 'balanced', chilli: 'balanced' },
];

const heatColors: Record<string, string> = {
  surplus: 'bg-green-100 text-green-700 border-green-300',
  deficit: 'bg-red-100 text-red-700 border-red-300',
  balanced: 'bg-earth-100 text-earth-600 border-earth-300',
};

export function AdminSupplyDemand() {
  const { produceListings, buyers, crops } = useApp();
  const [district, setDistrict] = useState('All Clusters');
  const [cropFilter, setCropFilter] = useState('All');

  const cropNames = useMemo(() => {
    const names = new Set<string>();
    crops.forEach((c) => names.add(c.name));
    produceListings.forEach((p) => names.add(p.crop));
    return ['All', ...Array.from(names).sort()];
  }, [crops, produceListings]);

  const supplyDemandData = useMemo(() => {
    const available = produceListings.filter((p) => p.status === 'available' || p.status === 'reserved');
    const cropSupply = new Map<string, number>();
    available.forEach((p) => {
      cropSupply.set(p.crop, (cropSupply.get(p.crop) || 0) + p.quantityKg);
    });
    const cropDemand = new Map<string, number>();
    buyers.forEach((b) => {
      cropDemand.set(b.requiredCrop, (cropDemand.get(b.requiredCrop) || 0) + b.requiredQtyKg);
    });

    const allCrops = new Set([...cropSupply.keys(), ...cropDemand.keys()]);
    let rows = Array.from(allCrops).map((crop) => {
      const supply = cropSupply.get(crop) || 0;
      const demand = cropDemand.get(crop) || 0;
      const surplus = supply - demand;
      const surplusResult = computeSurplusRisk(supply, Math.max(1, demand));
      return {
        crop,
        supply,
        demand,
        surplus,
        status: surplus > 0 ? 'Surplus' : surplus < 0 ? 'Deficit' : 'Balanced',
        risk: surplusResult.risk,
      };
    });

    if (cropFilter !== 'All') {
      rows = rows.filter((r) => r.crop === cropFilter);
    }

    return rows.sort((a, b) => Math.abs(b.surplus) - Math.abs(a.surplus));
  }, [produceListings, buyers, cropFilter]);

  const filteredHeatmap = district === 'All Clusters' ? heatmapData : heatmapData.filter((r) => r.district === district);

  return (
    <div>
      <PageHeader
        title="Supply & Demand"
        subtitle="Live supply-demand analysis computed from marketplace listings and buyer requirements"
        icon={<BarChart3 className="w-5 h-5" />}
      />

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-earth-500 mb-1 block">Cluster / Zone</label>
            <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-earth-500 mb-1 block">Crop</label>
            <select className="input" value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
              {cropNames.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Supply vs Demand Chart */}
      <Card className="mb-6">
        <CardHeader title="Supply vs Demand" subtitle="Live comparison by crop (kg)" icon={<TrendingUp className="w-5 h-5" />} />
        <div className="p-5 pt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplyDemandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="crop" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="supply" fill="#f59e0b" name="Supply" radius={[4, 4, 0, 0]} />
              <Bar dataKey="demand" fill="#3b82f6" name="Demand" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Table */}
      <Card className="mb-6">
        <CardHeader title="Supply-Demand Analysis" subtitle={cropFilter === 'All' ? 'All crops' : `Filtered: ${cropFilter}`} icon={<BarChart3 className="w-5 h-5" />} />
        <div className="overflow-x-auto">
          {supplyDemandData.length === 0 ? (
            <div className="p-12 text-center text-earth-500">No data for the selected filters.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Crop</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Supply (kg)</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Demand (kg)</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Surplus/Deficit</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {supplyDemandData.map((item) => (
                  <tr key={item.crop} className="border-b border-earth-100 last:border-0 hover:bg-earth-50">
                    <td className="px-4 py-3 text-sm font-medium text-earth-900">{item.crop}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{item.supply.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-right text-earth-700">{item.demand.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={item.surplus > 0 ? 'text-green-600 font-semibold' : item.surplus < 0 ? 'text-red-600 font-semibold' : 'text-earth-500 font-medium'}>
                        {item.surplus > 0 ? '+' : ''}{item.surplus.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'Surplus' ? 'success' : item.status === 'Deficit' ? 'danger' : 'neutral'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.risk === 'LOW' ? 'success' : item.risk === 'MEDIUM' ? 'warning' : 'danger'}>
                        {item.risk} RISK
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader title="Regional Heatmap" subtitle={district === 'All Clusters' ? 'All clusters' : `Filtered: ${district}`} icon={<MapPin className="w-5 h-5" />} />
        <div className="p-5 pt-2 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2">District</th>
                {['Tomato', 'Rice', 'Onion', 'Potato', 'Chilli'].map((c) => (
                  <th key={c} className="text-center text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHeatmap.map((row) => (
                <tr key={row.district}>
                  <td className="px-3 py-2 text-sm font-medium text-earth-900">{row.district}</td>
                  {(['tomato', 'rice', 'onion', 'potato', 'chilli'] as const).map((crop) => (
                    <td key={crop} className="px-3 py-2 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${heatColors[row[crop]]}`}>
                        {row[crop].charAt(0).toUpperCase() + row[crop].slice(1)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

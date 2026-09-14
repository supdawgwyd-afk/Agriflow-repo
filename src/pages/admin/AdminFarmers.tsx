import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { Sprout, Search, MapPin, Star, IndianRupee, Package } from 'lucide-react';

export function AdminFarmers() {
  const { farmers } = useApp();
  const [search, setSearch] = useState('');

  const filtered = farmers.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Farmers"
        subtitle={`${farmers.length} registered farmers across the system`}
        icon={<Sprout className="w-5 h-5" />}
      />

      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
          <input
            type="text"
            placeholder="Search by name, village, or district..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((farmer) => (
          <Card key={farmer.id} hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center font-bold">
                  {farmer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-earth-900">{farmer.name}</p>
                  <p className="text-xs text-earth-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.village}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="text-xs font-medium">{farmer.rating}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Produce</span>
                <span className="font-medium text-earth-900">{farmer.totalProduceKg.toLocaleString('en-IN')} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Earnings</span>
                <span className="font-medium text-earth-900">₹{farmer.totalEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Pending</span>
                <span className={`font-medium ${farmer.pendingPayments > 0 ? 'text-amber-600' : 'text-agri-600'}`}>₹{farmer.pendingPayments.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500">Land</span>
                <span className="font-medium text-earth-900">{farmer.landAcres} acres</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-earth-100">
              {farmer.crops.map((crop) => (
                <Badge key={crop} variant="agri">{crop}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

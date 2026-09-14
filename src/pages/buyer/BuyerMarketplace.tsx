import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import type { ProduceListing, CropType } from '@/types';
import {
  ShoppingBag, Search, MapPin, IndianRupee, Package, Wheat,
  Filter, ArrowRight,
} from 'lucide-react';

const cropFilters: (CropType | 'All')[] = ['All', 'Tomato', 'Potato', 'Onion', 'Rice', 'Maize', 'Chilli', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut'];

export function BuyerMarketplace() {
  const { produceListings, buyers, placeOrder } = useApp();
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState<CropType | 'All'>('All');
  const [selected, setSelected] = useState<ProduceListing | null>(null);
  const buyer = buyers[0];

  const filtered = produceListings.filter((p) => {
    const matchesSearch = p.farmerName.toLowerCase().includes(search.toLowerCase()) || p.crop.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = cropFilter === 'All' || p.crop === cropFilter;
    return matchesSearch && matchesCrop;
  });

  const handleOrder = (produce: ProduceListing) => {
    placeOrder({
      buyerId: buyer.id,
      buyerName: buyer.name,
      farmerId: produce.farmerId,
      farmerName: produce.farmerName,
      crop: produce.crop,
      quantityKg: produce.quantityKg,
      pricePerKg: produce.pricePerKg,
      totalAmount: produce.quantityKg * produce.pricePerKg,
      deliveryDate: '2026-09-05',
      centreId: produce.centreId,
    });
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle="Browse available produce from farmers"
        icon={<ShoppingBag className="w-5 h-5" />}
      />

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search by farmer or crop..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-earth-400 flex-shrink-0" />
            {cropFilters.map((crop) => (
              <button
                key={crop}
                onClick={() => setCropFilter(crop)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  cropFilter === crop ? 'bg-agri-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Produce Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} hover className="p-5" onClick={() => setSelected(item)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-earth-900">{item.crop}</p>
                  <p className="text-xs text-earth-500">Grade {item.quality}</p>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-earth-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Quantity</span>
                <span className="font-semibold text-earth-900">{item.quantityKg} kg</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-earth-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Price</span>
                <span className="font-semibold text-earth-900">₹{item.pricePerKg}/kg</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-earth-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Distance</span>
                <span className="font-semibold text-earth-900">{item.distanceKm} km</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-earth-500 flex items-center gap-1.5"><Wheat className="w-3.5 h-3.5" /> Farmer</span>
                <span className="font-medium text-earth-700 truncate ml-2">{item.farmerName}</span>
              </div>
            </div>

            {item.availableInDays > 0 && (
              <div className="mt-3 pt-3 border-t border-earth-100">
                <Badge variant="info">Available in {item.availableInDays} days</Badge>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.crop || ''} subtitle="Produce Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Farmer</p><p className="font-semibold text-earth-900">{selected.farmerName}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quantity</p><p className="font-semibold text-earth-900">{selected.quantityKg} kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Price</p><p className="font-semibold text-earth-900">₹{selected.pricePerKg}/kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Quality</p><p className="font-semibold text-earth-900">Grade {selected.quality}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Location</p><p className="font-semibold text-earth-900">{selected.location}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-xs text-earth-500">Distance</p><p className="font-semibold text-earth-900">{selected.distanceKm} km</p></div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-agri-50 border border-agri-200">
              <span className="text-sm font-medium text-agri-800">Total Value</span>
              <span className="text-lg font-bold text-agri-700">₹{(selected.quantityKg * selected.pricePerKg).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleOrder(selected)} className="btn-primary flex-1">
                Place Order <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

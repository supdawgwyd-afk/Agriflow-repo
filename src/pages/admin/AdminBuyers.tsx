import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { buyers as allBuyers } from '@/data/mockData';
import {
  Users, ShoppingBag, Package, IndianRupee, Shield, MapPin, Star,
} from 'lucide-react';

export function AdminBuyers() {
  return (
    <div>
      <PageHeader
        title="Buyers"
        subtitle={`${allBuyers.length} active buyers across the system`}
        icon={<Users className="w-5 h-5" />}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBuyers.map((buyer) => (
          <Card key={buyer.id} hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-earth-900">{buyer.name}</p>
                  <p className="text-xs text-earth-500">{buyer.type}</p>
                </div>
              </div>
              <Badge variant="agri">{buyer.id}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Required</span>
                <span className="font-medium text-earth-900">{buyer.requiredQtyKg} kg {buyer.requiredCrop}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Offer</span>
                <span className="font-medium text-earth-900">₹{buyer.offeredPrice}/kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</span>
                <span className="font-medium text-earth-900">{buyer.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Distance</span>
                <span className="font-medium text-earth-900">{buyer.distanceKm} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Reliability</span>
                <span className="font-medium text-earth-900 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  {buyer.reliabilityPct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-earth-500 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Active Orders</span>
                <span className="font-medium text-earth-900">{buyer.activeOrders}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  User, MapPin, ShoppingBag, Package, IndianRupee,
  Shield, Star, TrendingUp, ShoppingCart,
} from 'lucide-react';

export function BuyerProfile() {
  const { buyers, orders } = useApp();
  const buyer = buyers[0];
  const myOrders = orders.filter((o) => o.buyerId === buyer.id);
  const totalSpent = myOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Your buyer account details"
        icon={<User className="w-5 h-5" />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-3xl font-bold font-display mx-auto mb-4">
              {buyer.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-earth-900 font-display">{buyer.name}</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-sm font-medium text-earth-700">{(buyer.reliabilityPct / 20).toFixed(1)}</span>
              <span className="text-sm text-earth-400">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 text-sm text-earth-500">
              <MapPin className="w-4 h-4" />
              {buyer.location}
            </div>
            <Badge variant="agri" className="mt-3">{buyer.type}</Badge>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Required Crop</span>
              <span className="font-medium text-earth-900">{buyer.requiredCrop}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><Package className="w-4 h-4" /> Required Qty</span>
              <span className="font-medium text-earth-900">{buyer.requiredQtyKg} kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Offered Price</span>
              <span className="font-medium text-earth-900">₹{buyer.offeredPrice}/kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><Shield className="w-4 h-4" /> Reliability</span>
              <span className="font-medium text-earth-900">{buyer.reliabilityPct}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Distance</span>
              <span className="font-medium text-earth-900">{buyer.distanceKm} km</span>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <ShoppingCart className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">{myOrders.length}</p>
              <p className="text-xs text-earth-500">Total Orders</p>
            </Card>
            <Card className="p-4 text-center">
              <IndianRupee className="w-6 h-6 text-agri-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">₹{(totalSpent / 100000).toFixed(1)}L</p>
              <p className="text-xs text-earth-500">Total Spent</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">{buyer.activeOrders}</p>
              <p className="text-xs text-earth-500">Active Orders</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-6 h-6 text-agri-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">{buyer.reliabilityPct}%</p>
              <p className="text-xs text-earth-500">Reliability</p>
            </Card>
          </div>

          <Card>
            <CardHeader title="Procurement History" subtitle="Recent orders" icon={<TrendingUp className="w-5 h-5" />} />
            <div className="p-5 pt-2 space-y-2">
              {myOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-earth-100">
                  <div>
                    <p className="font-medium text-sm text-earth-900">{order.orderNumber}</p>
                    <p className="text-xs text-earth-500">{order.crop} • {order.quantityKg} kg • {order.farmerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-earth-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    <Badge variant={order.status === 'Completed' ? 'success' : 'info'}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}



import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { StatusTracker } from '@/components/ui/StatusTracker';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { ORDER_STATUSES } from '@/types';
import type { OrderStatus } from '@/types';
import {
  ShoppingCart, Package, ChevronDown, ArrowRight,
} from 'lucide-react';

export function BuyerOrders() {
  const { orders, buyers, updateOrderStatus } = useApp();
  const buyer = buyers[0];
  const myOrders = orders.filter((o) => o.buyerId === buyer.id);

  const nextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = ORDER_STATUSES.indexOf(current);
    if (idx < 0 || idx >= ORDER_STATUSES.length - 1) return null;
    return ORDER_STATUSES[idx + 1];
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track and manage your procurement orders"
        icon={<ShoppingCart className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-earth-500">Total Orders</p><p className="text-2xl font-bold text-earth-900 mt-1">{myOrders.length}</p></Card>
        <Card className="p-4"><p className="text-sm text-earth-500">Active</p><p className="text-2xl font-bold text-amber-600 mt-1">{myOrders.filter(o => !['Delivered', 'Completed'].includes(o.status)).length}</p></Card>
        <Card className="p-4"><p className="text-sm text-earth-500">Completed</p><p className="text-2xl font-bold text-agri-600 mt-1">{myOrders.filter(o => o.status === 'Completed').length}</p></Card>
        <Card className="p-4"><p className="text-sm text-earth-500">Total Value</p><p className="text-2xl font-bold text-earth-900 mt-1">₹{myOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}</p></Card>
      </div>

      {myOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No orders yet. Visit the Marketplace to place your first order.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const next = nextStatus(order.status);
            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 lg:w-56 flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-earth-900">{order.orderNumber}</p>
                      <p className="text-sm text-earth-500">{order.crop} • {order.quantityKg} kg</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-earth-500">Farmer</p>
                    <p className="font-medium text-earth-900">{order.farmerName}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-earth-500">Amount</p>
                    <p className="font-semibold text-earth-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="text-center">
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="text-xs border border-earth-300 rounded-lg px-2 py-1.5 pr-7 bg-white text-earth-700 focus:outline-none focus:ring-2 focus:ring-agri-500/30 appearance-none cursor-pointer"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-earth-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {next && (
                      <button
                        onClick={() => updateOrderStatus(order.id, next)}
                        className="btn-primary text-xs !py-1.5 !px-3 whitespace-nowrap"
                      >
                        Advance <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-earth-100">
                  <StatusTracker stages={ORDER_STATUSES} currentStage={order.status} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

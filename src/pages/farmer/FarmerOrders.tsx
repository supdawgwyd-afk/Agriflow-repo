import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { StatusTracker } from '@/components/ui/StatusTracker';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { ORDER_STATUSES } from '@/types';
import type { Order } from '@/types';
import {
  ShoppingCart, Package, IndianRupee, Calendar, ArrowRight,
} from 'lucide-react';

export function FarmerOrders() {
  const { orders, currentFarmer } = useApp();
  const myOrders = orders.filter((o) => o.farmerId === currentFarmer.id || o.farmerId === 'F01');

  const statusIndex = (status: string) => ORDER_STATUSES.indexOf(status as any);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track your order lifecycle from placement to payment"
        icon={<ShoppingCart className="w-5 h-5" />}
      />

      {/* Order Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-earth-500">Total Orders</p>
          <p className="text-2xl font-bold text-earth-900 mt-1">{myOrders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-earth-500">Active</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{myOrders.filter((o) => !['Delivered', 'Completed'].includes(o.status)).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-earth-500">Completed</p>
          <p className="text-2xl font-bold text-agri-600 mt-1">{myOrders.filter((o) => o.status === 'Completed').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-earth-500">Total Value</p>
          <p className="text-2xl font-bold text-earth-900 mt-1">₹{myOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')}</p>
        </Card>
      </div>

      <div className="space-y-4">
        {myOrders.map((order) => (
          <Card key={order.id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Order Info */}
              <div className="flex items-center gap-3 lg:w-64 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-earth-900">{order.orderNumber}</p>
                  <p className="text-sm text-earth-500">{order.crop} • {order.quantityKg} kg</p>
                </div>
              </div>

              {/* Buyer */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-earth-500">Buyer</p>
                <p className="font-medium text-earth-900 truncate">{order.buyerName}</p>
              </div>

              {/* Amount */}
              <div className="text-center">
                <p className="text-xs text-earth-500">Amount</p>
                <p className="font-semibold text-earth-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              </div>

              {/* Status */}
              <div className="text-center">
                <StatusBadge status={order.status} />
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="mt-4 pt-4 border-t border-earth-100">
              <StatusTracker
                stages={ORDER_STATUSES}
                currentStage={order.status}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

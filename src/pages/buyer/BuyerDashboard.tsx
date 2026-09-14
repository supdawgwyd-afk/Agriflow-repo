import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard, AIRecommendationRow } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, Sparkles,
  ArrowRight, IndianRupee, TrendingUp, Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { buyerFulfillmentData } from '@/data/mockData';

export function BuyerDashboard() {
  const { orders, produceListings, buyers } = useApp();
  const navigate = useNavigate();
  const buyer = buyers[0];
  const myOrders = orders.filter((o) => o.buyerId === buyer.id);
  const activeOrders = myOrders.filter((o) => !['Delivered', 'Completed'].includes(o.status));
  const availableProduce = produceListings.filter((p) => p.status === 'available' && p.crop === buyer.requiredCrop);
  const pendingDeliveries = myOrders.filter((o) => ['Collection Scheduled', 'In Transit'].includes(o.status));

  return (
    <div>
      <PageHeader
        title={buyer.name}
        subtitle={`${buyer.type} • ${buyer.location} • Required: ${buyer.requiredCrop}`}
        icon={<LayoutDashboard className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Required Produce" value={`${buyer.requiredQtyKg} kg`} icon={<Package className="w-5 h-5" />} color="agri" subtitle={buyer.requiredCrop} />
        <KPICard label="Available" value={`${availableProduce.length} listings`} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <KPICard label="Active Orders" value={`${activeOrders.length}`} icon={<ShoppingCart className="w-5 h-5" />} color="amber" />
        <KPICard label="Pending Deliveries" value={`${pendingDeliveries.length}`} icon={<Truck className="w-5 h-5" />} color="earth" />
      </div>

      {/* AI Recommendation */}
      <div className="mb-6">
        <AIInsightCard
          title="AI Buyer Recommendations"
          badge="AI Prediction"
          reasoning="Based on your requirements, 3 farmer clusters have been identified that match your quantity, quality, and delivery needs."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-xl p-4 border border-agri-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-agri-600" />
                <p className="font-semibold text-earth-900">Best Match: Farmer Cluster #12</p>
              </div>
              <div className="space-y-1">
                <AIRecommendationRow label="Total Produce" value="750 kg" icon={<Package className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Distance" value="8.2 km" icon={<TrendingUp className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Price" value="₹30/kg" icon={<IndianRupee className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Match Score" value="94%" icon={<Sparkles className="w-3.5 h-3.5" />} />
              </div>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-earth-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-earth-900">Alternative: Farmer Cluster #8</p>
              </div>
              <div className="space-y-1">
                <AIRecommendationRow label="Total Produce" value="750 kg" icon={<Package className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Distance" value="14.9 km" icon={<TrendingUp className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Price" value="₹18/kg" icon={<IndianRupee className="w-3.5 h-3.5" />} />
                <AIRecommendationRow label="Match Score" value="88%" icon={<Sparkles className="w-3.5 h-3.5" />} />
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/buyer/ai-matches')} className="btn-primary w-full mt-3">
            View All AI Matches <ArrowRight className="w-4 h-4" />
          </button>
        </AIInsightCard>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Fulfillment Rate" subtitle="Order fulfillment trend (%)" icon={<TrendingUp className="w-5 h-5" />} />
          <div className="p-5 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buyerFulfillmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Line type="monotone" dataKey="fulfillment" stroke="#22c55e" strokeWidth={2} name="Fulfillment %" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Orders" subtitle="Your latest procurement orders" icon={<ShoppingCart className="w-5 h-5" />} />
          <div className="p-5 pt-2 space-y-3">
            {myOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-earth-100 hover:bg-earth-50 cursor-pointer" onClick={() => navigate('/buyer/orders')}>
                <div>
                  <p className="font-medium text-sm text-earth-900">{order.orderNumber}</p>
                  <p className="text-xs text-earth-500">{order.crop} • {order.quantityKg} kg • {order.farmerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-earth-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Placed' ? 'neutral' : 'info'}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import {
  User, MapPin, Phone, Calendar, Sprout, Star, Wallet,
  IndianRupee, Award, TrendingUp,
} from 'lucide-react';

export function FarmerProfile() {
  const { currentFarmer, crops, payments } = useApp();
  const completedPayments = payments.filter((p) => p.status === 'Completed');

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Your farmer account details"
        icon={<User className="w-5 h-5" />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 lg:col-span-1">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-agri-600 text-white flex items-center justify-center text-3xl font-bold font-display mx-auto mb-4">
              {currentFarmer.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-earth-900 font-display">{currentFarmer.name}</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-sm font-medium text-earth-700">{currentFarmer.rating}</span>
              <span className="text-sm text-earth-400">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 text-sm text-earth-500">
              <MapPin className="w-4 h-4" />
              {currentFarmer.village}, {currentFarmer.district}
            </div>
            <Badge variant="agri" className="mt-3">Verified Farmer</Badge>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</span>
              <span className="font-medium text-earth-900">{currentFarmer.phone}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined</span>
              <span className="font-medium text-earth-900">{currentFarmer.joinedDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-earth-500 flex items-center gap-2"><Sprout className="w-4 h-4" /> Land</span>
              <span className="font-medium text-earth-900">{currentFarmer.landAcres} acres</span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Sprout className="w-6 h-6 text-agri-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">{crops.length}</p>
              <p className="text-xs text-earth-500">Active Crops</p>
            </Card>
            <Card className="p-4 text-center">
              <Wallet className="w-6 h-6 text-agri-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">₹{(currentFarmer.totalEarnings / 1000).toFixed(0)}K</p>
              <p className="text-xs text-earth-500">Total Earnings</p>
            </Card>
            <Card className="p-4 text-center">
              <IndianRupee className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-600">₹{(currentFarmer.pendingPayments / 1000).toFixed(0)}K</p>
              <p className="text-xs text-earth-500">Pending</p>
            </Card>
            <Card className="p-4 text-center">
              <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-earth-900">{completedPayments.length}</p>
              <p className="text-xs text-earth-500">Transactions</p>
            </Card>
          </div>

          <Card>
            <CardHeader title="Crops Grown" icon={<Sprout className="w-5 h-5" />} />
            <div className="p-5 pt-2 flex flex-wrap gap-2">
              {currentFarmer.crops.map((crop) => (
                <Badge key={crop} variant="agri">{crop}</Badge>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Performance" subtitle="Last 6 months" icon={<TrendingUp className="w-5 h-5" />} />
            <div className="p-5 pt-2 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-earth-500">On-time delivery rate</span>
                  <span className="font-semibold text-agri-600">94%</span>
                </div>
                <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                  <div className="h-full rounded-full bg-agri-500" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-earth-500">Quality consistency</span>
                  <span className="font-semibold text-agri-600">91%</span>
                </div>
                <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                  <div className="h-full rounded-full bg-agri-500" style={{ width: '91%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-earth-500">Buyer satisfaction</span>
                  <span className="font-semibold text-agri-600">88%</span>
                </div>
                <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                  <div className="h-full rounded-full bg-agri-500" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

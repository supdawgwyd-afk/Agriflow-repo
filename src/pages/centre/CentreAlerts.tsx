import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { NotificationList } from '@/components/ui/Notification';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useApp } from '@/context/AppContext';
import {
  AlertTriangle, Users, Clock, AlertCircle, Sparkles, TrendingUp,
} from 'lucide-react';

export function CentreAlerts() {
  const { notifications, centres, markNotificationRead } = useApp();
  const centre = centres[0];
  const centreNotifs = notifications.filter((n) => n.role === 'centre');

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle={`${centre.name} • AI alerts and operational warnings`}
        icon={<AlertTriangle className="w-5 h-5" />}
      />

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Critical</p><p className="text-xl font-bold text-red-600">{centreNotifs.filter(n => n.severity === 'danger').length}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Warnings</p><p className="text-xl font-bold text-amber-600">{centreNotifs.filter(n => n.severity === 'warning').length}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div><p className="text-sm text-earth-500">Info</p><p className="text-xl font-bold text-blue-600">{centreNotifs.filter(n => n.severity === 'info').length}</p></div>
          </div>
        </Card>
      </div>

      {/* AI Congestion Alert */}
      <div className="mb-6">
        <AIInsightCard
          title="AI Congestion Prediction"
          badge="AI Alert"
          variant="warning"
          reasoning="Based on arrival forecasts and current processing rate, congestion is expected to peak between 10:30 AM and 12:00 PM."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-900">Capacity Warning</span>
              </div>
              <p className="text-sm text-red-700">Centre at {centre.capacityPct}% capacity. Predicted to reach 94% by 10:30 AM.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Farmer Surge</span>
              </div>
              <p className="text-sm text-amber-700">14 farmers predicted to arrive in next 30 minutes. Prepare extra weighing bays.</p>
            </div>
          </div>
        </AIInsightCard>
      </div>

      {/* All Alerts */}
      <Card className="p-4">
        <CardHeader title="All Alerts" subtitle="Operational notifications" icon={<AlertTriangle className="w-5 h-5" />} />
        <div className="mt-2">
          <NotificationList notifications={centreNotifs} onRead={markNotificationRead} />
        </div>
      </Card>
    </div>
  );
}

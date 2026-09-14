import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { NotificationList } from '@/components/ui/Notification';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useApp } from '@/context/AppContext';
import { generateAdminAlerts } from '@/utils/aiSimulation';
import {
  AlertTriangle, AlertCircle, CheckCircle, Sparkles,
} from 'lucide-react';

export function AdminAlerts() {
  const { notifications, centres, produceListings, buyers, markNotificationRead } = useApp();
  const adminNotifs = notifications.filter((n) => n.role === 'admin');
  const liveAlerts = generateAdminAlerts(centres, produceListings, buyers);

  const alertColorMap = {
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-green-50 text-green-700 border-green-200',
  };

  const alertIconMap = {
    danger: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  return (
    <div>
      <PageHeader
        title="AI Alerts"
        subtitle="System-wide AI predictions and alerts"
        icon={<AlertTriangle className="w-5 h-5" />}
      />

      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-earth-500">Critical</p>
              <p className="text-2xl font-bold text-red-600">{liveAlerts.filter(a => a.severity === 'danger').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-earth-500">Warnings</p>
              <p className="text-2xl font-bold text-amber-600">{liveAlerts.filter(a => a.severity === 'warning').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-earth-500">Positive</p>
              <p className="text-2xl font-bold text-green-600">{liveAlerts.filter(a => a.severity === 'success').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Live AI Alert Cards */}
      <div className="mb-6">
        <AIInsightCard title="AI Alert Summary" badge="AI Simulation" variant="warning">
          {liveAlerts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-earth-500">No active alerts. All systems operating normally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveAlerts.map((alert, i) => {
                const Icon = alertIconMap[alert.severity];
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${alertColorMap[alert.severity]}`}>
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-earth-900">{alert.title}</p>
                      <p className="text-sm text-earth-700 mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AIInsightCard>
      </div>

      <Card className="p-4">
        <CardHeader title="All Notifications" subtitle="Complete notification history" icon={<AlertTriangle className="w-5 h-5" />} />
        <div className="mt-2">
          {adminNotifs.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 mx-auto text-earth-300 mb-2" />
              <p className="text-sm text-earth-500">No notifications. Actions across the system will generate notifications here.</p>
            </div>
          ) : (
            <NotificationList notifications={adminNotifs} onRead={markNotificationRead} />
          )}
        </div>
      </Card>
    </div>
  );
}

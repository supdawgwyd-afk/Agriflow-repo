import { Card, CardHeader } from '@/components/ui/Card';
import { NotificationList } from '@/components/ui/Notification';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { Bell, CheckCheck } from 'lucide-react';

export function FarmerNotifications() {
  const { notifications, markNotificationRead } = useApp();
  const farmerNotifs = notifications.filter((n) => n.role === 'farmer');
  const unread = farmerNotifs.filter((n) => !n.read);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread.length} unread of ${farmerNotifs.length} total`}
        icon={<Bell className="w-5 h-5" />}
        action={
          <button
            onClick={() => farmerNotifs.forEach((n) => !n.read && markNotificationRead(n.id))}
            className="btn-secondary"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        }
      />

      <Card className="p-4">
        <NotificationList notifications={farmerNotifs} onRead={markNotificationRead} />
      </Card>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { Notification } from '@/types';

const severityConfig = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  danger: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead?: (id: string) => void;
}) {
  const config = severityConfig[notification.severity];
  const Icon = config.icon;
  return (
    <div
      onClick={() => onRead?.(notification.id)}
      className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-card ${
        notification.read ? 'bg-white border-earth-200' : `${config.bg} ${config.border}`
      }`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${config.bg} ${config.color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm text-earth-900">{notification.title}</p>
          <span className="text-xs text-earth-400 flex-shrink-0">{notification.time}</span>
        </div>
        <p className="text-sm text-earth-600 mt-0.5">{notification.message}</p>
      </div>
      {!notification.read && <div className="w-2 h-2 rounded-full bg-agri-500 flex-shrink-0 mt-2" />}
    </div>
  );
}

export function NotificationList({
  notifications,
  onRead,
}: {
  notifications: Notification[];
  onRead?: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-earth-400">
        <Bell className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No notifications</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onRead={onRead} />
      ))}
    </div>
  );
}

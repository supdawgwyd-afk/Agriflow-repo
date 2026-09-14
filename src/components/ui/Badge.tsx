import type { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'agri';

const variants: Record<Variant, string> = {
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  neutral: 'bg-earth-100 text-earth-700 border border-earth-200',
  agri: 'bg-agri-50 text-agri-700 border border-agri-200',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, icon, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    'AVAILABLE': 'success',
    'MODERATE': 'warning',
    'HIGH LOAD': 'danger',
    'OVERLOADED': 'danger',
    'LOW': 'success',
    'MEDIUM': 'warning',
    'HIGH': 'danger',
    'VERY HIGH': 'danger',
    'Completed': 'success',
    'Processing': 'info',
    'Pending': 'warning',
    'Placed': 'neutral',
    'Confirmed': 'info',
    'Collection Scheduled': 'info',
    'In Transit': 'warning',
    'Delivered': 'success',
    'available': 'success',
    'reserved': 'warning',
    'sold': 'neutral',
    'growing': 'info',
    'ready': 'success',
    'harvested': 'neutral',
    'booked': 'info',
    'arrived': 'warning',
    'Scheduled': 'info',
    'Registered': 'neutral',
    'Arrived': 'info',
    'Waiting': 'warning',
    'Weighing': 'info',
    'Quality Check': 'info',
    'Procured': 'agri',
    'Payment': 'success',
  };
  const v = map[status] || 'neutral';
  return <Badge variant={v}>{status}</Badge>;
}

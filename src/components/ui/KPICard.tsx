import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  color?: 'agri' | 'blue' | 'amber' | 'red' | 'earth';
  subtitle?: string;
}

const colorMap = {
  agri: 'bg-agri-50 text-agri-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  earth: 'bg-earth-100 text-earth-600',
};

export function KPICard({ label, value, icon, trend, color = 'agri', subtitle }: KPICardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-earth-500">{label}</p>
          <p className="text-2xl font-bold text-earth-900 mt-1 font-display">{value}</p>
          {subtitle && <p className="text-xs text-earth-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          {trend.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
          {trend.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
          {trend.direction === 'neutral' && <Minus className="w-4 h-4 text-earth-400" />}
          <span className={`text-xs font-medium ${
            trend.direction === 'up' ? 'text-green-600' :
            trend.direction === 'down' ? 'text-red-600' : 'text-earth-500'
          }`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}

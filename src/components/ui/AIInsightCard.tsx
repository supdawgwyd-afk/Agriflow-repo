import type { ReactNode } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  badge?: string;
  children: ReactNode;
  variant?: 'default' | 'warning' | 'success';
  reasoning?: string;
  icon?: ReactNode;
}

const variantStyles = {
  default: 'border-agri-200 bg-gradient-to-br from-agri-50/50 to-white',
  warning: 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white',
  success: 'border-green-200 bg-gradient-to-br from-green-50/50 to-white',
};

export function AIInsightCard({ title, badge, children, variant = 'default', reasoning, icon }: AIInsightCardProps) {
  return (
    <div className={`rounded-2xl border-2 ${variantStyles[variant]} p-5 shadow-card`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-agri-600 text-white flex items-center justify-center">
            {icon || <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-earth-900">{title}</h3>
            {badge && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-agri-600 mt-0.5">
                <Sparkles className="w-3 h-3" /> {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
      {reasoning && (
        <div className="mt-4 pt-4 border-t border-earth-200/50">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-earth-600">{reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIRecommendationRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-earth-500 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-earth-900">{value}</span>
    </div>
  );
}

export function ConfidenceIndicator({ value }: { value: number }) {
  const color = value >= 85 ? 'text-green-600 bg-green-50' : value >= 70 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-earth-200 overflow-hidden">
        <div className="h-full rounded-full bg-agri-500" style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{value}%</span>
    </div>
  );
}

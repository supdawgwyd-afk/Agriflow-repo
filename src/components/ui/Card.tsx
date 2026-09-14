import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card ${hover ? 'card-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, icon, action, badge, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-5 pb-3 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-agri-50 text-agri-600 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-earth-900 text-base">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-earth-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

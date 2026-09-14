import { useApp } from '@/context/AppContext';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const config = {
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-600' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-600' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-600' },
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full sm:w-96 animate-fade-in">
      {toasts.map((toast) => {
        const c = config[toast.type];
        const Icon = c.icon;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${c.bg} ${c.border} shadow-elevated animate-slide-in`}
          >
            <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} />
            <p className={`text-sm font-medium ${c.text} flex-1`}>{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-earth-400 hover:text-earth-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { CheckCircle, ShieldAlert, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map(toast => {
        const config = {
          success: {
            icon: <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0" />,
            strip: 'bg-[#15803d]',
            iconBg: 'bg-[#f0fdf4]',
          },
          error: {
            icon: <ShieldAlert className="w-4 h-4 text-[#b91c1c] shrink-0" />,
            strip: 'bg-[#b91c1c]',
            iconBg: 'bg-[#fef2f2]',
          },
          warning: {
            icon: <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0" />,
            strip: 'bg-[#b45309]',
            iconBg: 'bg-[#fffbeb]',
          },
          info: {
            icon: <Info className="w-4 h-4 text-[#555f6d] shrink-0" />,
            strip: 'bg-[#555f6d]',
            iconBg: 'bg-[#f0f2f5]',
          },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex bg-white border border-[#e4e7ec] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden animate-slideInRight"
          >
            {/* Left accent strip */}
            <div className={`w-1 shrink-0 ${config.strip}`} />

            <div className="flex items-start gap-3 p-3 flex-1">
              {/* Icon */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg}`}>
                {config.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0d1117] leading-tight">{toast.title}</p>
                <p className="text-[11px] text-[#9ca3af] mt-0.5 leading-tight">{toast.description}</p>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-[#9ca3af] hover:text-[#555f6d] transition-colors shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

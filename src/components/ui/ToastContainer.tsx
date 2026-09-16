import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useVistora();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-18 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#171717] dark:bg-white text-white dark:text-[#171717] rounded-2xl shadow-xl border border-[#333333] dark:border-gray-200 animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-[#FFD21F] shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-[#FFD21F] shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#FFD21F] shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white dark:hover:text-black p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

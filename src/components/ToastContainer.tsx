import React from 'react';
import { useLinks } from '../context/LinkContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLinks();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              isSuccess
                ? 'bg-emerald-950/90 dark:bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/20'
                : isError
                ? 'bg-rose-950/90 dark:bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/20'
                : isWarning
                ? 'bg-amber-950/90 dark:bg-amber-950/90 text-amber-100 border-amber-800/80 shadow-amber-950/20'
                : 'bg-slate-900/90 dark:bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-slate-950/20'
            }`}
          >
            <div className="mr-3 mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-brand-400" />}
            </div>

            <div className="flex-1 text-sm font-medium pr-2">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

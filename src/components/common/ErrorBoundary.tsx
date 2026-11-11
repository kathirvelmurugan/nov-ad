import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitleAr?: string;
  fallbackTitleEn?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isRtl = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
      return (
        <div
          role="alert"
          className="min-h-[50vh] flex items-center justify-center p-6"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                {isRtl ? 'حدث خطأ مؤقت أثناء تحميل الشاشة' : 'Temporary Screen Loading Issue'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isRtl
                  ? 'تم استرداد النظام وحماية الجلسة السريرية. انقر أدناه لتحديث العرض والمتابعة.'
                  : 'The system has safely isolated the view. Click below to refresh and continue.'}
              </p>
            </div>
            {this.state.error && (
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer w-full"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إعادة تحميل الشاشة' : 'Reload Screen'}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

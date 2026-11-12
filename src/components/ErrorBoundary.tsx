import { Button } from './ui/Button';
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";


interface Props {
  children?: ReactNode;
  fallbackModuleId?: string;
  onNavigate?: (id: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-surface-default rounded-2xl border border-ui-borderSubtle dark:border-ink shadow-brand-sm mx-auto max-w-2xl mt-12 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-ui-error dark:bg-ui-errorText/20 text-ui-errorText dark:text-ui-errorText rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="w-10 h-10" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-txt-primary dark:text-txt-primary mb-3 tracking-tight">
            Component Rendering Error
          </h2>
          <p className="text-txt-secondary dark:text-txt-tertiary mb-8 max-w-md leading-relaxed">
            We encountered an unexpected issue while loading this view. The application has safely recovered to prevent a complete crash.
          </p>
          
          {this.state.error && (
            <div className="mb-8 w-full max-w-lg bg-ui-error dark:bg-ui-errorText/10 border border-ui-errorBorder dark:border-ui-errorText/30 rounded-2xl p-4 text-left overflow-hidden">
              <p className="text-xs font-mono text-ui-errorText dark:text-ui-errorText break-words">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            {this.props.onNavigate && (
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  this.props.onNavigate?.(this.props.fallbackModuleId || "home");
                }}
                className="flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink-700 text-white rounded-xl font-semibold transition-colors shadow-brand-sm hover:shadow"
              >
                <Home className="w-5 h-5" />
                Return Home
              </Button>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-surface-active dark:bg-ink hover:bg-secondary-300 dark:hover:bg-ink-600 text-txt-primary dark:text-txt-primary rounded-xl font-semibold transition-colors shadow-brand-sm hover:shadow"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

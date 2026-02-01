import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary - catches unhandled errors and shows a friendly fallback
 * instead of a blank/white screen. Essential for production and mobile APK.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      if (typeof console !== 'undefined' && console.error) {
        console.error('[ErrorBoundary]', error, errorInfo);
      }
      this.props.onError?.(error, errorInfo);
    } catch (e) {
      // Silently fail - don't let error reporting crash the boundary
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-200">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl">🌟</div>
            <h1 className="text-2xl font-serif font-bold text-amber-300">
              Something went wrong
            </h1>
            <p className="text-slate-400 text-sm">
              The cosmic alignment was briefly disrupted. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold rounded-xl transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 border border-slate-600 text-slate-400 rounded-lg hover:border-slate-500 hover:text-white text-sm transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, RefreshIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Added a constructor to initialize state and call super(props). This resolves errors where 'this.state' and 'this.props' were considered non-existent, and consequently fixes the 'children' prop error in index.tsx.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-white text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-brand-blue-dark">Something went wrong.</h1>
            <p className="mt-2 text-gray-600">
                An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
                onClick={this.handleRefresh}
                className="mt-6 flex items-center px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-light transition"
            >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Refresh Page
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

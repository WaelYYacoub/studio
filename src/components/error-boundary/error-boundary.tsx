"use client";
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log scanner errors but don't show them to users
    if (error.message?.includes('scanner') || error.message?.includes('Cannot stop')) {
      console.log('Scanner error caught (safe to ignore):', error.message);
      // Reset error state immediately for scanner errors
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 0);
      return;
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    // Don't show error UI for scanner errors - they're harmless
    if (this.state.hasError && this.state.error?.message?.includes('Cannot stop')) {
      return this.props.children;
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>
            <p className="text-gray-600 mb-4">
              An error occurred. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
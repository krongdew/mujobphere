// components/ErrorBoundary.jsx
'use client';

import React from 'react';
import { logSecurityEvent } from '@/lib/security/logging';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
 // ถ้าเป็น error เกี่ยวกับ auth ให้ redirect ไปหน้า login
 if (error.message.includes('role') || error.message.includes('session')) {
  window.location.href = '/';
  return;
}

// Log error ตามปกติ
logSecurityEvent('client_error', {
  error: error.message,
  stack: error.stack,
  componentStack: errorInfo.componentStack
});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
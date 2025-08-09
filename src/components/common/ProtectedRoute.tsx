import { ReactNode } from 'react';

import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { isChecking, isValid } = useAuthGuard();

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not valid, show fallback or redirect (handled by useAuthGuard)
  if (!isValid) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  // User is authenticated and valid, render children
  return <>{children}</>;
};

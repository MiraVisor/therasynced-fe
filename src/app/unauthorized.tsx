import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/redux/hooks/useAppHooks';

const Unauthorized = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-600">
              You don&apos;t have permission to access this page. Please sign in to continue.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <Button
              onClick={() => router.push('/authentication/sign-in')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default Unauthorized;

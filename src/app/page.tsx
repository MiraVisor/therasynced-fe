'use client';

import LandingPage from '@/components/core/LandingPage/page';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function Home() {
  const { isAuthenticated, token } = useAuth();

  console.log('isAuthenticated', isAuthenticated);
  console.log('token', token);

  return <>{isAuthenticated ? <>Dashboard</> : <LandingPage />}</>;
}

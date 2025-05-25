'use client';

import LandingPage from '@/components/core/LandingPage/page';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return <>{isAuthenticated ? <>Dashboard</> : <LandingPage />}</>;
}

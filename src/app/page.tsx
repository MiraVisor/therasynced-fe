'use client';

import { useEffect, useState } from 'react';

import LandingPage from '@/components/core/LandingPage/page';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
console.log("isAuthenticated",isAuthenticated)
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  return <>{isAuthenticated ? <>Dashboard</> : <LandingPage />}</>;
}

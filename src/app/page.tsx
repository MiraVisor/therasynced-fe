'use client';

import { useEffect, useState } from 'react';

import LandingPage from '@/components/core/LandingPage/page';

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  return <>{<LandingPage />}</>;
}

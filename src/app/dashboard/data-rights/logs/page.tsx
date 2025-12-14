'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyHealthDataLogsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to account settings with logs tab
    router.replace('/dashboard/account?tab=logs');
  }, [router]);

  return null;
}

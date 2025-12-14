'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DataRightsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to account settings with data-rights tab
    router.replace('/dashboard/account?tab=data-rights');
  }, [router]);

  return null;
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SubscriptionTabsProps {
  overviewContent: React.ReactNode;
  billingContent: React.ReactNode;
  plansContent: React.ReactNode;
  defaultTab?: 'overview' | 'billing' | 'plans';
}

export function SubscriptionTabs({
  overviewContent,
  billingContent,
  plansContent,
  defaultTab = 'overview',
}: SubscriptionTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'plans'>(defaultTab);

  // Sync tab with URL query param
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'overview' || viewParam === 'billing' || viewParam === 'plans') {
      setActiveTab(viewParam);
    } else if (!viewParam && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const tabValue = value as 'overview' | 'billing' | 'plans';
    setActiveTab(tabValue);

    // Update URL with view query param, preserving existing params
    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Preserve tab param if it exists
    const tabParam = params.get('tab') || params.get('section');

    // Update or remove view param
    if (tabValue === 'overview') {
      params.delete('view');
    } else {
      params.set('view', tabValue);
    }

    // Ensure tab param is set
    if (tabParam) {
      params.set('tab', tabParam);
    } else {
      params.set('tab', 'subscription');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

    router.push(newUrl, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <TabsTrigger
          value="overview"
          className="font-poppins font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="billing"
          className="font-poppins font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
        >
          Billing
        </TabsTrigger>
        <TabsTrigger
          value="plans"
          className="font-poppins font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
        >
          Plans
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-0">
        {overviewContent}
      </TabsContent>
      <TabsContent value="billing" className="mt-0">
        {billingContent}
      </TabsContent>
      <TabsContent value="plans" className="mt-0">
        {plansContent}
      </TabsContent>
    </Tabs>
  );
}

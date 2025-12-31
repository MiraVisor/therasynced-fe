'use client';

import { FileText, Shield, ShieldAlert } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AccessLogsTab } from './AccessLogsTab';
import { BreachesTab } from './BreachesTab';
import { ExportLogsTab } from './ExportLogsTab';

interface AuditDashboardProps {
  activeTab?: string;
}

export function AuditDashboard({ activeTab: initialTab }: AuditDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from query params, default to 'breaches'
  const getActiveTab = () => {
    if (initialTab) return initialTab;

    // Support ?tab=breaches format (preferred)
    const tab = searchParams.get('tab');
    if (tab && ['breaches', 'access-logs', 'export-logs'].includes(tab)) {
      return tab;
    }

    // Support legacy format: ?breaches, ?access-logs, ?export-logs
    if (searchParams.has('breaches')) return 'breaches';
    if (searchParams.has('access-logs')) return 'access-logs';
    if (searchParams.has('export-logs')) return 'export-logs';

    return 'breaches';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`/dashboard/admin/audit?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breaches" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Data Breaches
          </TabsTrigger>
          <TabsTrigger value="access-logs" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Access Logs
          </TabsTrigger>
          <TabsTrigger value="export-logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breaches" className="mt-6">
          <BreachesTab />
        </TabsContent>

        <TabsContent value="access-logs" className="mt-6">
          <AccessLogsTab />
        </TabsContent>

        <TabsContent value="export-logs" className="mt-6">
          <ExportLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

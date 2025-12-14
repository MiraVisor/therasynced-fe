'use client';

import { FileText, Shield, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AccessLogsTab } from './AccessLogsTab';
import { BreachesTab } from './BreachesTab';
import { ExportLogsTab } from './ExportLogsTab';

export function AuditDashboard() {
  const [activeTab, setActiveTab] = useState('breaches');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

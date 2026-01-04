'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { usePatientStamps } from '@/hooks/queries/useLoyalty';

import { StampCard } from './StampCard';

interface StampSummaryProps {
  onViewDetail?: (therapistId: string) => void;
}

export function StampSummary({ onViewDetail }: StampSummaryProps) {
  // Use React Query hook
  const { data: stampSummaries = [], isLoading, error } = usePatientStamps();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error loading stamps: {error instanceof Error ? error.message : String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stampSummaries || stampSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Stamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>You don&apos;t have any stamps yet.</p>
            <p className="text-sm mt-2">
              Book appointments with freelancers to start earning stamps!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Stamps</h2>
        <p className="text-sm text-gray-600">
          {stampSummaries.length} freelancer{stampSummaries.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stampSummaries.map((stamp) => (
          <StampCard key={stamp.therapist.id} stamp={stamp} onViewDetail={onViewDetail} />
        ))}
      </div>
    </div>
  );
}

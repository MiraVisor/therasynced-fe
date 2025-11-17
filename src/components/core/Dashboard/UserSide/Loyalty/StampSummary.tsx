'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getPatientStamps } from '@/redux/api/loyaltyApi';
import { RootState } from '@/redux/store';

import { StampCard } from './StampCard';

interface StampSummaryProps {
  onViewDetail?: (therapistId: string) => void;
}

export function StampSummary({ onViewDetail }: StampSummaryProps) {
  const dispatch = useDispatch();
  const { stampSummaries, isLoading, error } = useSelector((state: RootState) => state.stamps);
  const stampsFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch if:
    // 1. Not currently loading
    // 2. Not already fetched (using ref to prevent re-fetches on re-renders)
    // 3. No stamps data exists
    if (
      !isLoading &&
      !stampsFetchedRef.current &&
      (!stampSummaries || stampSummaries.length === 0)
    ) {
      stampsFetchedRef.current = true;
      const fetchStamps = async () => {
        try {
          await dispatch(getPatientStamps() as any);
        } catch (error) {
          toast.error('Failed to load stamps. Please try again.');
          // Reset ref on error so it can retry
          stampsFetchedRef.current = false;
        }
      };

      fetchStamps();
    }
    // Mark as fetched if stamps are loaded
    if (stampSummaries && stampSummaries.length > 0) {
      stampsFetchedRef.current = true;
    }
  }, [dispatch, isLoading, stampSummaries?.length]);

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
            <p>Error loading stamps: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stampSummaries || stampSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Therapist Stamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>You don&apos;t have any stamps yet.</p>
            <p className="text-sm mt-2">
              Book appointments with therapists to start earning stamps!
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
          {stampSummaries.length} therapist{stampSummaries.length !== 1 ? 's' : ''}
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

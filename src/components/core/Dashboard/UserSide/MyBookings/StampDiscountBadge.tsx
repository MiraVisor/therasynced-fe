'use client';

import { Gift } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getStampDetail } from '@/redux/api/loyaltyApi';
import { RootState } from '@/redux/store';

interface StampDiscountBadgeProps {
  therapistId: string;
}

export function StampDiscountBadge({ therapistId }: StampDiscountBadgeProps) {
  const dispatch = useDispatch();
  const { stampDetail, isLoadingDetail, selectedTherapistId } = useSelector(
    (state: RootState) => state.stamps,
  );

  useEffect(() => {
    // Only fetch if:
    // 1. therapistId is provided
    // 2. Not currently loading
    // 3. Don't have detail for this therapist already loaded
    if (
      therapistId &&
      !isLoadingDetail &&
      (!stampDetail ||
        stampDetail.therapist.id !== therapistId ||
        selectedTherapistId !== therapistId)
    ) {
      dispatch(getStampDetail(therapistId) as any);
    }
  }, [dispatch, therapistId, isLoadingDetail, stampDetail?.therapist.id, selectedTherapistId]);

  // Show discount if reward is ready and not already reserved
  if (
    isLoadingDetail ||
    !stampDetail ||
    !stampDetail.rewardReady ||
    stampDetail.rewardReserved ||
    stampDetail.therapist.id !== therapistId
  ) {
    return null;
  }

  return (
    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
            <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              Stamp Reward Available!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              You&apos;ll receive a {stampDetail.discountPercentage}% discount on this booking
            </p>
          </div>
          <Badge variant="default" className="bg-green-600 text-white">
            -{stampDetail.discountPercentage}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

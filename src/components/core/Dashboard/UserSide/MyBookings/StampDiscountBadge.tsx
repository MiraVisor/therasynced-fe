'use client';

import { Gift } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <Gift className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
      <span className="text-sm font-medium text-green-900 dark:text-green-100">
        {stampDetail.discountPercentage}% discount applied
      </span>
    </div>
  );
}

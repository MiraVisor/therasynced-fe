'use client';

import { CheckCircle2, Gift, Sparkles, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TherapistStampSummary } from '@/types/types';

interface StampCardProps {
  stamp: TherapistStampSummary;
  onViewDetail?: (therapistId: string) => void;
}

export function StampCard({ stamp, onViewDetail }: StampCardProps) {
  const router = useRouter();
  const progressPercentage = (stamp.currentStampCount / stamp.stampTarget) * 100;

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(stamp.therapist.id);
    } else {
      router.push(`/dashboard/loyalty/stamps/${stamp.therapist.id}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Therapist Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage
              src={stamp.therapist.profilePicture || undefined}
              alt={stamp.therapist.name}
            />
            <AvatarFallback>
              <User className="h-8 w-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>

          {/* Stamp Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-poppins font-semibold text-lg text-gray-900">
                {stamp.therapist.name}
              </h3>
              <p className="text-sm font-inter text-gray-600">
                {stamp.currentStampCount} of {stamp.stampTarget} stamps
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs font-inter text-gray-600">
                <span>{stamp.stampsRemaining} stamps to reward</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
            </div>

            {/* Reward Status */}
            {stamp.rewardReady && (
              <div className="flex items-center gap-2">
                {stamp.rewardReserved ? (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Gift className="h-3 w-3 mr-1" />
                    Reward Reserved
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {stamp.discountPercentage}% Discount Available!
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm font-inter text-gray-600">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>{stamp.rewardCyclesCompleted} cycles completed</span>
              </div>
              {stamp.customConfigApplied && (
                <Badge variant="outline" className="text-xs">
                  Custom Config
                </Badge>
              )}
            </div>

            {/* Action Button */}
            <Button variant="outline" className="w-full" onClick={handleViewDetail}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { ArrowLeft, CheckCircle2, Gift, History, Sparkles, Stamp, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useStampDetail } from '@/hooks/queries/useLoyalty';
import { StampHistory } from '@/types/types';

interface StampDetailProps {
  therapistId: string;
  onBack?: () => void;
}

const getEventTypeLabel = (eventType: StampHistory['eventType']) => {
  switch (eventType) {
    case 'STAMP_AWARDED':
      return 'Stamp Awarded';
    case 'REWARD_READY':
      return 'Reward Ready';
    case 'REWARD_RESERVED':
      return 'Reward Reserved';
    case 'REWARD_CONSUMED':
      return 'Reward Used';
    case 'REWARD_RELEASED':
      return 'Reward Released';
    case 'STAMP_RESET':
      return 'Stamps Reset';
    default:
      return eventType;
  }
};

const getEventIcon = (eventType: StampHistory['eventType']) => {
  switch (eventType) {
    case 'STAMP_AWARDED':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'REWARD_READY':
      return <Gift className="h-4 w-4 text-blue-600" />;
    case 'REWARD_RESERVED':
      return <Gift className="h-4 w-4 text-yellow-600" />;
    case 'REWARD_CONSUMED':
      return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
    case 'REWARD_RELEASED':
      return <History className="h-4 w-4 text-orange-600" />;
    case 'STAMP_RESET':
      return <Sparkles className="h-4 w-4 text-gray-600" />;
    default:
      return <History className="h-4 w-4" />;
  }
};

export function StampDetail({ therapistId, onBack }: StampDetailProps) {
  // Use React Query hook
  const { data: stampDetail, isLoading: isLoadingDetail, error } = useStampDetail(therapistId);

  if (isLoadingDetail) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !stampDetail) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error loading stamp details: {error || 'Not found'}</p>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stamps
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (stampDetail.currentStampCount / stampDetail.stampTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stamps
        </Button>
      )}

      {/* Therapist Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage
                src={stampDetail.therapist.profilePicture || undefined}
                alt={stampDetail.therapist.name}
              />
              <AvatarFallback>
                <User className="h-10 w-10 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{stampDetail.therapist.name}</h2>
              <p className="text-gray-600">Therapist Stamp Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Stamps Collected</span>
              <span className="text-2xl font-bold text-gray-900">
                {stampDetail.currentStampCount} / {stampDetail.stampTarget}
              </span>
            </div>

            {/* Visual Stamps Display */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {Array.from({ length: stampDetail.stampTarget }, (_, index) => {
                const isFilled = index < stampDetail.currentStampCount;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all ${
                      isFilled
                        ? 'bg-green-500 border-green-600 text-white shadow-md'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isFilled ? (
                      <CheckCircle2 className="h-8 w-8" />
                    ) : (
                      <Stamp className="h-6 w-6" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>{stampDetail.stampsRemaining} stamps remaining</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Stamps Earned</p>
              <p className="text-lg font-semibold text-gray-900">{stampDetail.totalStampsEarned}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Reward Cycles</p>
              <p className="text-lg font-semibold text-gray-900">
                {stampDetail.rewardCyclesCompleted}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Discount</p>
              <p className="text-lg font-semibold text-green-600">
                {stampDetail.discountPercentage}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Last Stamp</p>
              <p className="text-sm font-medium text-gray-700">
                {stampDetail.lastStampIssuedAt
                  ? new Date(stampDetail.lastStampIssuedAt).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Reward Status */}
          {stampDetail.rewardReady && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                {stampDetail.rewardReserved ? (
                  <>
                    <Gift className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Reward Reserved</p>
                      <p className="text-sm text-gray-600">
                        Your {stampDetail.discountPercentage}% discount is reserved for your next
                        booking
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Reward Available!</p>
                      <p className="text-sm text-gray-600">
                        You&apos;ve earned a {stampDetail.discountPercentage}% discount on your next
                        visit
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {stampDetail.customConfigApplied && (
            <Badge variant="outline" className="mt-2">
              Custom Configuration Applied
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* History Card */}
      {stampDetail.histories && stampDetail.histories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Stamp History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // Deduplicate REWARD_RESERVED entries - keep only one per reservation reference
                const seenReservations = new Set<string>();
                const deduplicatedHistories = stampDetail.histories.filter((history) => {
                  if (history.eventType === 'REWARD_RESERVED' && history.notes) {
                    // Extract reservation reference from notes (format: "Reward reserved with reference XXX" or "Reservation XXX attached to booking")
                    const match = history.notes.match(/(?:reference|Reservation)\s+([a-f0-9-]+)/i);
                    if (match?.[1]) {
                      const ref = match[1];
                      if (seenReservations.has(ref)) {
                        return false; // Skip duplicate
                      }
                      seenReservations.add(ref);
                    }
                  }
                  return true;
                });
                return deduplicatedHistories;
              })().map((history) => (
                <div
                  key={history.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5">{getEventIcon(history.eventType)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {getEventTypeLabel(history.eventType)}
                      </p>
                      <span className="text-xs text-gray-500">
                        {history.createdAt
                          ? (() => {
                              try {
                                const date = new Date(history.createdAt);
                                if (isNaN(date.getTime())) {
                                  return 'Date unavailable';
                                }
                                return date.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                });
                              } catch (error) {
                                return 'Date unavailable';
                              }
                            })()
                          : 'Date unavailable'}
                      </span>
                    </div>
                    {history.notes && <p className="text-xs text-gray-600 mt-1">{history.notes}</p>}
                    {history.stampNumber && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Stamp #{history.stampNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

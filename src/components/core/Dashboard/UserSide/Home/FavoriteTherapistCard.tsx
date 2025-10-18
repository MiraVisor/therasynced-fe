'use client';

import { Clock, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerifiedAvatar } from '@/components/ui/verification-badge';
import { Expert } from '@/types/types';

interface FavoriteTherapistCardProps {
  therapist: Expert;
  onBook: (therapist: Expert) => void;
}

const FavoriteTherapistCard: React.FC<FavoriteTherapistCardProps> = ({ therapist, onBook }) => {
  const hasAvailableSlots = (therapist.availableSlots || 0) > 0;
  const nextAvailableSlot = therapist.slotSummary?.nextAvailable;

  const getNextAvailableText = () => {
    if (!hasAvailableSlots) return 'No slots available';
    if (nextAvailableSlot) {
      const date = new Date(nextAvailableSlot.startTime);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

      if (isToday) return 'Available today';
      if (isTomorrow) return 'Available tomorrow';
      return `Available ${date.toLocaleDateString('en-US', { weekday: 'short' })}`;
    }
    return 'Slots available';
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <VerifiedAvatar
            name={therapist.name}
            verificationStatus={therapist.verificationStatus}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {therapist.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {therapist.specialty || 'Therapist'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {therapist.rating || 5.0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({therapist.reviews || 0})
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">{getNextAvailableText()}</div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-primary">
              From €{therapist.pricing?.online?.min || 50}/session
            </div>
            <Button
              onClick={() => onBook(therapist)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={!hasAvailableSlots}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteTherapistCard;

'use client';

import { CheckCircle, Clock, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { Expert } from '@/types/types';

interface FavoriteFreelancerCardProps {
  freelancer: Expert;
  onBook: (freelancer: Expert) => void;
}

const FavoriteFreelancerCard: React.FC<FavoriteFreelancerCardProps> = ({ freelancer, onBook }) => {
  const hasAvailableSlots = (freelancer.availableSlots || 0) > 0;
  const nextAvailableSlot = freelancer.slotSummary?.nextAvailable;

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
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {freelancer.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {freelancer.name}
              </h3>
              <VerificationBadge status={freelancer.verificationStatus || 'unverified'} size="sm" />
            </div>
            {freelancer.jobTitle?.name ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {freelancer.jobTitle.name}
              </p>
            ) : freelancer.specialty ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {freelancer.specialty}
              </p>
            ) : null}
            {freelancer.rating && freelancer.rating > 0 ? (
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(freelancer.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({freelancer.rating})
                </span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">No ratings yet</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Additional Details */}
          <div className="space-y-1">
            {freelancer.yearsOfExperience && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {freelancer.yearsOfExperience} years
                </span>
              </div>
            )}
            {freelancer.reviews && freelancer.reviews > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Reviews:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {freelancer.reviews}
                </span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">{getNextAvailableText()}</div>

          <div className="flex items-center justify-between">
            {freelancer.pricing?.online?.min ? (
              <div className="text-sm font-semibold text-primary">
                From €{freelancer.pricing.online.min}/session
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Contact for pricing</div>
            )}
            <Button
              onClick={() => onBook(freelancer)}
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

export default FavoriteFreelancerCard;

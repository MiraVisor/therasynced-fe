'use client';

import { ArrowRight, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerifiedAvatar } from '@/components/ui/verification-badge';
import { Expert } from '@/types/types';

interface QuickBookingWidgetProps {
  therapists: Expert[];
  loading?: boolean;
  onTherapistClick?: (therapist: Expert) => void;
}

const QuickBookingWidget: React.FC<QuickBookingWidgetProps> = ({
  therapists,
  loading = false,
  onTherapistClick,
}) => {
  const router = useRouter();

  const handleTherapistClick = (therapist: Expert) => {
    if (onTherapistClick) {
      onTherapistClick(therapist);
    } else {
      // Fallback: navigate to booking page
      router.push(`/dashboard/freelancer/${therapist.id}`);
    }
  };

  const handleViewAll = () => {
    router.push('/dashboard/explore');
  };

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Book Your Next Session
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!therapists || therapists.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Book Your Next Session
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No therapists available at the moment.
          </p>
          <Button onClick={handleViewAll} variant="outline">
            Explore All Therapists
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Book Your Next Session
          </h2>
          <Button
            onClick={handleViewAll}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            See All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {therapists.slice(0, 4).map((therapist) => (
            <Card
              key={therapist.id}
              className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleTherapistClick(therapist)}
            >
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">Next: Tomorrow 2pm</div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-primary">
                      From €{therapist.pricing?.online?.min || 50}/session
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickBookingWidget;

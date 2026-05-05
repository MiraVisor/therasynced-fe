'use client';

import { ArrowRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { Expert } from '@/types/types';

interface QuickBookingWidgetProps {
  freelancers: Expert[];
  loading?: boolean;
  onFreelancerClick?: (freelancer: Expert) => void;
}

const QuickBookingWidget: React.FC<QuickBookingWidgetProps> = ({
  freelancers,
  loading = false,
  onFreelancerClick,
}) => {
  const router = useRouter();

  const handleFreelancerClick = (freelancer: Expert) => {
    if (onFreelancerClick) {
      onFreelancerClick(freelancer);
    } else {
      // Fallback: navigate to booking page
      router.push(`/dashboard/freelancer/${freelancer.id}`);
    }
  };

  const handleViewAll = () => {
    router.push('/dashboard/explore');
  };

  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-poppins font-semibold text-gray-900">
              Book Your Next Session
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2 w-3/4" />
                        <div className="h-3 bg-gray-300 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-300 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!freelancers || freelancers.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-poppins font-semibold text-gray-900 mb-2">
            Book Your Next Session
          </h2>
          <p className="text-gray-600 mb-4">No freelancers available at the moment.</p>
          <Button onClick={handleViewAll} variant="outline">
            Explore All Freelancers
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Book Your Next Session</h2>
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
          {freelancers.slice(0, 4).map((freelancer) => (
            <Card
              key={freelancer.id}
              className="border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleFreelancerClick(freelancer)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {freelancer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{freelancer.name}</h3>
                      <VerificationBadge
                        status={freelancer.verificationStatus || 'unverified'}
                        size="sm"
                      />
                    </div>
                    {freelancer.jobTitle?.name ? (
                      <p className="text-sm text-gray-600 truncate">{freelancer.jobTitle.name}</p>
                    ) : freelancer.specialty ? (
                      <p className="text-sm text-gray-600 truncate">{freelancer.specialty}</p>
                    ) : null}
                    {freelancer.rating && freelancer.rating > 0 ? (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(freelancer.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({freelancer.rating})</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1">No ratings yet</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-gray-600">Next: Tomorrow 2pm</div>

                  <div className="flex items-center justify-between">
                    {freelancer.pricing?.online?.min ? (
                      <div className="text-sm font-semibold text-primary">
                        From €{freelancer.pricing.online.min}/session
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Contact for pricing</div>
                    )}
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

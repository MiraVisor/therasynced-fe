'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAvailableSlots } from '@/hooks/queries/useSlots';
import { Expert } from '@/types/types';

import ModernBookingFlow from './ModernBookingFlow';

interface MyBookingHomeProps {
  rescheduleBookingId?: string | null;
}

// Define booking steps with icons

const MyBookingHome: React.FC<MyBookingHomeProps> = ({ rescheduleBookingId }) => {
  const params = useParams();
  const searchParams = useSearchParams();

  const freelancerId = Array.isArray(params?.freelancerId)
    ? params?.freelancerId[0]
    : params?.freelancerId;

  // Use React Query hook
  const { data: slots = [] } = useAvailableSlots(freelancerId || null);
  const [showModernFlow, setShowModernFlow] = useState(true);
  const [freelancer, setFreelancer] = useState<Expert | null>(null);

  // Get freelancer data from URL params or fallback to slot data
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const freelancerData = JSON.parse(decodeURIComponent(dataParam));
        setFreelancer(freelancerData);
      } catch (error) {
        // Fallback to slot data
        const firstSlot = slots && slots.length > 0 ? slots[0] : null;
        if (firstSlot) {
          setFreelancer({
            id: firstSlot.freelancerId,
            name: firstSlot.freelancerName || 'Unknown',
            specialty: 'Therapist',
            rating: firstSlot.averageRating || 0,
            reviews: firstSlot.numberOfRatings || 0,
            yearsOfExperience: '0+ years',
            description: '',
            profilePicture: firstSlot.profilePicture,
          } as Expert);
        }
      }
    } else {
      // Fallback to slot data if no URL data
      const firstSlot = slots && slots.length > 0 ? slots[0] : null;
      if (firstSlot) {
        setFreelancer({
          id: firstSlot.freelancerId,
          name: firstSlot.freelancerName || 'Unknown',
          specialty: 'Therapist',
          rating: firstSlot.averageRating || 0,
          reviews: firstSlot.numberOfRatings || 0,
          yearsOfExperience: '0+ years',
          description: '',
          profilePicture: firstSlot.profilePicture,
        } as Expert);
      }
    }
  }, [searchParams, slots]);

  if (!freelancer) {
    return <div>No freelancer data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Therapist Header */}
      {/* <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage src={freelancer.profilePicture} />
              <AvatarFallback className="text-lg font-semibold text-primary">
                {freelancer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl font-poppins font-bold text-charcoal mb-1">
                {freelancer.name}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{freelancer.specialty}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  ⭐ {freelancer.rating} ({freelancer.reviews} reviews)
                </span>
                <span>•</span>
                <span>{freelancer.yearsOfExperience} experience</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowModernFlow(!showModernFlow)}
              className="border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
            >
              {showModernFlow ? 'Show Classic View' : 'Show Modern Flow'}
            </Button>
          </div>
        </CardHeader>
      </Card> */}

      {/* Booking Flow */}
      {showModernFlow ? (
        <ModernBookingFlow rescheduleBookingId={rescheduleBookingId} freelancerData={freelancer} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Classic booking view is being updated...</p>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => setShowModernFlow(true)}
          >
            Use Modern Booking Flow
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyBookingHome;

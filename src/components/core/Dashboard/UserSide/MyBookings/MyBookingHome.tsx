'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchFreelancerSlots } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';

import ModernBookingFlow from './ModernBookingFlow';

interface MyBookingHomeProps {
  rescheduleBookingId?: string | null;
}

const MyBookingHome: React.FC<MyBookingHomeProps> = ({ rescheduleBookingId }) => {
  const params = useParams();
  const dispatch = useDispatch();

  const freelancerId = Array.isArray(params?.freelancerId)
    ? params?.freelancerId[0]
    : params?.freelancerId;
  const { slots } = useSelector((state: RootState) => state.overview);
  const [showModernFlow, setShowModernFlow] = useState(true);

  useEffect(() => {
    if (freelancerId) {
      dispatch(
        fetchFreelancerSlots({
          page: 1,
          limit: 10,
          sortBy: 'startTime',
          sortOrder: 'asc',
          freelancerId: freelancerId,
        }) as any,
      );
    }
  }, [dispatch, freelancerId]);

  // Extract freelancer info from API data
  const firstSlot = slots && slots.length > 0 ? slots[0] : null;
  const therapist = firstSlot
    ? {
        id: firstSlot.freelancerId,
        name: firstSlot.freelancer?.name || firstSlot.freelancerName || 'Therapist',
        specialty: firstSlot.freelancer?.mainService || firstSlot.mainService || 'Therapy',
        rating: firstSlot.freelancer?.averageRating || firstSlot.averageRating || 4.5,
        reviews: firstSlot.freelancer?.patientStories || firstSlot.numberOfRatings || 0,
        avatar: firstSlot.freelancer?.profilePicture || firstSlot.profilePicture || '',
        experience: firstSlot.freelancer?.yearsOfExperience
          ? `${firstSlot.freelancer.yearsOfExperience}+ years`
          : firstSlot.freelancer?.createdAt
            ? `${Math.floor((new Date().getTime() - new Date(firstSlot.freelancer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))}+ years`
            : 'Experienced',
        location:
          firstSlot.freelancer?.locations?.[0]?.name || firstSlot.location?.name || 'Online',
        services: firstSlot.freelancer?.services || [],
        sessionTypes: firstSlot.freelancer?.sessionTypes || ['online', 'office'],
        pricing: firstSlot.freelancer?.pricing || {
          online: { min: 80, max: 120 },
          office: { min: 100, max: 150 },
          home: { min: 120, max: 180 },
        },
        // Additional data from API
        description:
          firstSlot.freelancer?.description ||
          'Professional therapist dedicated to helping clients achieve mental wellness.',
        languages: firstSlot.freelancer?.languages || ['English'],
        education: firstSlot.freelancer?.education || [],
        certifications: firstSlot.freelancer?.certifications || [],
        availableSlots: firstSlot.freelancer?.slotSummary?.availableSlots || 0,
        totalSlots: firstSlot.freelancer?.slotSummary?.totalSlots || 0,
        nextAvailableSlot: firstSlot.freelancer?.slotSummary?.nextAvailable,
        cardInfo: firstSlot.freelancer?.cardInfo || {},
        isFavorite: firstSlot.freelancer?.isFavorite || false,
      }
    : null;

  if (!therapist) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading therapist information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Therapist Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={therapist.avatar} />
              <AvatarFallback className="text-lg font-semibold text-primary">
                {therapist.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {therapist.name}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{therapist.specialty}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  ⭐ {therapist.rating} ({therapist.reviews} reviews)
                </span>
                <span>•</span>
                <span>{therapist.experience} experience</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowModernFlow(!showModernFlow)}
              className="text-primary border-primary/20 hover:bg-primary/5"
            >
              {showModernFlow ? 'Show Classic View' : 'Show Modern Flow'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Booking Flow */}
      {showModernFlow ? (
        <ModernBookingFlow rescheduleBookingId={rescheduleBookingId} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Classic booking view is being updated...</p>
          <Button onClick={() => setShowModernFlow(true)}>Use Modern Booking Flow</Button>
        </div>
      )}
    </div>
  );
};

export default MyBookingHome;

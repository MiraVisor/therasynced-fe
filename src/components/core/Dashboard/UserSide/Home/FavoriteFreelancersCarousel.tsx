'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useFavoriteFreelancers } from '@/hooks/useFreelancers';
import { Expert } from '@/types/types';

import FavoriteFreelancerCard from './FavoriteTherapistCard';
import InlineBookingModal from './InlineBookingModal';

interface FavoriteFreelancersCarouselProps {
  className?: string;
}

const FavoriteFreelancersCarousel = ({ className }: FavoriteFreelancersCarouselProps) => {
  const router = useRouter();
  const { favoriteFreelancers, loading, error } = useFavoriteFreelancers();

  const handleBook = useCallback(
    (freelancer: Expert) => {
      // Navigate to explore page with this freelancer selected
      router.push(`/dashboard/explore?freelancerId=${freelancer.id}`);
    },
    [router],
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Favorite Freelancers
          </CardTitle>
          <CardDescription>Your saved therapists and experts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !favoriteFreelancers || favoriteFreelancers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Favorite Freelancers
          </CardTitle>
          <CardDescription>Your saved therapists and experts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error || 'No favorite freelancers yet'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Add some favorites from the explore page to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
          Favorite Freelancers
        </CardTitle>
        <CardDescription>Your saved therapists and experts</CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {favoriteFreelancers.map((freelancer: any) => {
              // Map freelancer to Expert format
              const expert: Expert = {
                id: freelancer.id,
                name: freelancer.name || 'Unknown',
                specialty: freelancer.mainJobTitle?.name || 'Therapist',
                jobTitle: freelancer.mainJobTitle,
                yearsOfExperience: freelancer.yearsOfExperience?.toString() || '',
                rating: freelancer.averageRating || 0,
                reviews: freelancer.numberOfRatings || 0,
                description: freelancer.description || '',
                isFavorite: true,
                profilePicture: freelancer.profilePicture,
                verificationStatus: freelancer.verificationStatus || 'unverified',
                availableSlots: freelancer.slotSummary?.totalSlots || 0,
                slotSummary: freelancer.slotSummary,
              };

              return (
                <CarouselItem
                  key={freelancer.id}
                  className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <FavoriteFreelancerCard freelancer={expert} onBook={handleBook} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="-left-4 hidden md:flex" />
          <CarouselNext className="-right-4 hidden md:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default FavoriteFreelancersCarousel;

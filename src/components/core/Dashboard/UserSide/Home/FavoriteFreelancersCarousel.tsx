'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useFavoriteFreelancers } from '@/hooks/useFreelancers';
import { Expert, Freelancer } from '@/types/types';

import FavoriteFreelancerCard from './FavoriteTherapistCard';

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

  // Show toast error when error occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load favorite freelancers: ${error}`);
    }
  }, [error]);

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
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!favoriteFreelancers || favoriteFreelancers.length === 0) {
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
            <p className="text-sm text-gray-500 dark:text-gray-400">No favorite freelancers yet</p>
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
            {favoriteFreelancers.map((freelancer: Freelancer) => {
              // Map freelancer to Expert format
              const expert: Expert = {
                id: freelancer.id,
                name: freelancer.name,
                specialty:
                  freelancer.mainJobTitle?.name || freelancer.cardInfo?.mainService || 'Therapist',
                jobTitle: freelancer.mainJobTitle,
                yearsOfExperience: freelancer.cardInfo?.yearsOfExperience || '',
                rating: freelancer.cardInfo?.averageRating || 0,
                reviews: freelancer.cardInfo?.patientStories || 0,
                description: freelancer.cardInfo?.title || '',
                isFavorite: freelancer.isFavorite,
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

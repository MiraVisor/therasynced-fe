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
import { useFavoriteFreelancers } from '@/hooks/queries/useFreelancers';
import { Expert, Freelancer } from '@/types/types';
import { mapOneFreelancerToExpert } from '@/utils/freelancerMapper';

import FavoriteFreelancerCard from './FavoriteTherapistCard';

interface FavoriteFreelancersCarouselProps {
  className?: string;
}

const FavoriteFreelancersCarousel = ({ className }: FavoriteFreelancersCarouselProps) => {
  const router = useRouter();
  const { data: favoriteFreelancers = [], isLoading, error } = useFavoriteFreelancers();
  const handleBook = useCallback(
    (freelancer: Expert) => {
      // Pass freelancer data through route state to avoid loading issues
      const freelancerData = {
        id: freelancer.id,
        name: freelancer.name,
        specialty: freelancer.specialty,
        rating: freelancer.rating,
        reviews: freelancer.reviews,
        description: freelancer.description,
        isFavorite: freelancer.isFavorite,
        services: freelancer.services,
        location: freelancer.location,
        sessionTypes: freelancer.sessionTypes,
        pricing: freelancer.pricing,
        availableSlots: freelancer.availableSlots,
        cardInfo: freelancer.cardInfo,
      };

      router.push(
        `/dashboard/freelancer/${freelancer.id}?data=${encodeURIComponent(JSON.stringify(freelancerData))}`,
      );
    },
    [router],
  );

  // Show toast error when error occurs
  useEffect(() => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load favorite freelancers';
      toast.error(errorMessage);
    }
  }, [error]);
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Favorite Freelancers
          </CardTitle>
          <CardDescription className="font-inter">
            Your saved therapists and experts
          </CardDescription>
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
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
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
          <CardDescription className="font-inter">
            Your saved therapists and experts
          </CardDescription>
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
            align: 'center',
            loop: false,
            startIndex: favoriteFreelancers.length > 2 ? 1 : 0,
          }}
          className="w-full min-w-0"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {favoriteFreelancers.map((freelancer: Freelancer | Expert) => {
              // Use unified mapping function
              const expert = mapOneFreelancerToExpert(freelancer);

              return (
                <CarouselItem
                  key={expert.id}
                  className="basis-4/5 md:basis-3/5 lg:basis-2/5 min-w-[330px] pl-2 md:pl-4"
                >
                  <div className="flex justify-center">
                    <div className="w-full max-w-sm relative">
                      <FavoriteFreelancerCard freelancer={expert} onBook={handleBook} />
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="-left-4 hidden md:flex opacity-70 z-20" />
          <CarouselNext className="-right-4 hidden md:flex opacity-70 z-20" />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default FavoriteFreelancersCarousel;

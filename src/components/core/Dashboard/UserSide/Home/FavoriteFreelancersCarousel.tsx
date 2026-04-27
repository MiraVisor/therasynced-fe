'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
          <CardDescription className="font-inter">Your saved freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 border border-gray-200 rounded-lg p-4 space-y-4 overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-full animate-pulse" />
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
          <CardDescription className="font-inter">Your saved freelancers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Heart className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 favorite freelancers yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add some favorites from the explore page to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show only top 3 favorites
  const topFavorites = favoriteFreelancers.slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
              Favorite Freelancers
            </CardTitle>
            <CardDescription>Your saved freelancers</CardDescription>
          </div>
          {favoriteFreelancers.length > 3 && (
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/favorites')}>
              View All ({favoriteFreelancers.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {topFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topFavorites.map((freelancer: Freelancer | Expert) => {
              // Use unified mapping function
              const expert = mapOneFreelancerToExpert(freelancer);

              return (
                <div key={expert.id} className="w-full">
                  <FavoriteFreelancerCard freelancer={expert} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Heart className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 favorite freelancers yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add some favorites from the explore page to see them here
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/dashboard/explore')}
            >
              Explore Freelancers
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteFreelancersCarousel;

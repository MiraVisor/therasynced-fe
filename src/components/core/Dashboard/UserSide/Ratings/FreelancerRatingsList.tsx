'use client';

import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFreelancerRatings } from '@/hooks/queries/useRatings';
import { RatingWithDetails } from '@/types/types';

import { RatingDisplay } from './RatingDisplay';

interface FreelancerRatingsListProps {
  freelancerId: string;
  initialRatings?: RatingWithDetails[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const FreelancerRatingsList: React.FC<FreelancerRatingsListProps> = ({
  freelancerId,
  initialRatings = [],
  initialPagination,
}) => {
  const [page, setPage] = useState(initialPagination?.page || 1);
  const { data: ratingsData, isLoading: loading } = useFreelancerRatings(freelancerId, {
    page,
    limit: 10,
  });

  const ratings = ratingsData?.data || initialRatings;
  const pagination = ratingsData?.pagination || initialPagination;

  const loadRatings = (pageNum: number) => {
    setPage(pageNum);
  };

  if (ratings.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <RatingDisplay rating={0} reviewCount={0} size="sm" showCount={false} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {ratings.map((rating) => {
          const patient = (rating as { patient?: { name: string } })['patient'];
          const createdAt = (rating as { createdAt?: string | Date })['createdAt'];
          const ratingValue = (rating as { rating?: number })['rating'];
          return (
            <div
              key={(rating as { id: string }).id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
                      {patient?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-charcoal text-sm">
                        {patient?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (ratingValue || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-300  '
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {ratings.length} of {pagination.total} ratings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadRatings(page - 1)}
              disabled={!pagination.hasPrev || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadRatings(page + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Loading ratings...</p>
        </div>
      )}
    </div>
  );
};

export default FreelancerRatingsList;

'use client';

import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useBookingSearch } from '@/hooks/queries/useBookingSearch';
import { useAvailableSlots } from '@/hooks/queries/useSlots';
import { useBookingStore } from '@/stores/bookingStore';
import { Expert } from '@/types/types';

import { FreelancerCalendarCard } from '../FreelancerCalendarCard';

interface FreelancerResultsStepProps {
  onFreelancerDateSelect: (freelancerId: string, date: string) => void;
}

export const FreelancerResultsStep: React.FC<FreelancerResultsStepProps> = ({
  onFreelancerDateSelect,
}) => {
  const { preferredDate, selectedServiceCategories, locationPreference, freelancerSearchQuery } =
    useBookingStore();

  const { data, isLoading, error } = useBookingSearch({
    query: freelancerSearchQuery || undefined,
    serviceCategories: selectedServiceCategories.length > 0 ? selectedServiceCategories : undefined,
    locationPreference,
    preferredDate,
    enabled: true,
  });

  const freelancers = data?.freelancers || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-poppins font-semibold text-charcoal dark:text-white mb-2">
          Error loading therapists
        </h3>
        <p className="font-inter text-muted-foreground mb-4">
          Something went wrong. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (freelancers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-poppins font-semibold text-charcoal dark:text-white mb-2">
          No therapists found
        </h3>
        <p className="font-inter text-muted-foreground mb-4">
          Try adjusting your search criteria or preferences
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-poppins font-bold text-charcoal dark:text-white">
          Available Therapists
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-inter">
          {freelancers.length} {freelancers.length === 1 ? 'therapist' : 'therapists'} found
          {freelancerSearchQuery && ` matching "${freelancerSearchQuery}"`}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {freelancers.map((freelancer) => (
          <FreelancerWithSlots
            key={freelancer.id}
            freelancer={freelancer}
            onDateSelect={onFreelancerDateSelect}
            isHighlighted={
              !!freelancerSearchQuery &&
              freelancer.name.toLowerCase().includes(freelancerSearchQuery.toLowerCase())
            }
          />
        ))}
      </div>
    </div>
  );
};

// Component to fetch and display slots for a single freelancer
const FreelancerWithSlots: React.FC<{
  freelancer: Expert;
  onDateSelect: (freelancerId: string, date: string) => void;
  isHighlighted?: boolean;
}> = ({ freelancer, onDateSelect, isHighlighted }) => {
  const { data: slots = [], isLoading } = useAvailableSlots(freelancer.id);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    slots.forEach((slot) => {
      if (slot.status === 'AVAILABLE') {
        const date = format(new Date(slot.startTime), 'yyyy-MM-dd');
        dates.add(date);
      }
    });
    return Array.from(dates);
  }, [slots]);

  if (isLoading) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <FreelancerCalendarCard
      freelancer={freelancer}
      availableDates={availableDates}
      onDateSelect={onDateSelect}
      isHighlighted={isHighlighted}
    />
  );
};

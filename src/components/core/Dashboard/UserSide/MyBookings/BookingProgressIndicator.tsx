'use client';

import { Calendar, CheckCircle, CheckSquare, Clock, FileText, MapPin, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/bookingStore';

const steps = [
  { id: 1, title: 'Search', icon: Search, description: 'Find freelancer' },
  { id: 2, title: 'Select', icon: Calendar, description: 'Choose date' },
  { id: 3, title: 'Time', icon: Clock, description: 'Pick time slot' },
  { id: 4, title: 'Services', icon: CheckSquare, description: 'Select services' },
  { id: 5, title: 'Location', icon: MapPin, description: 'Choose location' },
  { id: 6, title: 'Review', icon: FileText, description: 'Confirm booking' },
];

interface BookingProgressIndicatorProps {
  totalSteps?: number;
}

export const BookingProgressIndicator: React.FC<BookingProgressIndicatorProps> = ({
  totalSteps = 6,
}) => {
  const { currentStep } = useBookingStore();

  const displaySteps = steps.slice(0, totalSteps);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {displaySteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                    isActive ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-400  ',
                    isCurrent && 'ring-4 ring-primary/20',
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <div
                    className={cn(
                      'text-xs font-medium',
                      isActive ? 'text-charcoal ' : 'text-gray-400 ',
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                </div>
              </div>
              {index < displaySteps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all',
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200 ',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

'use client';

import { format } from 'date-fns';
import { Calendar, MapPin, Star } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Expert } from '@/types/types';

export const FreelancerCalendarCard: React.FC<{
  freelancer: Expert;
  availableDates: string[];
  onDateSelect: (freelancerId: string, date: string) => void;
  isHighlighted?: boolean;
}> = ({ freelancer, availableDates, onDateSelect, isHighlighted = false }) => {
  // Get next 14 days
  const next14Days = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  const formatDateKey = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const isDateAvailable = (date: Date): boolean => {
    return availableDates.includes(formatDateKey(date));
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${isHighlighted ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-6">
        {/* Freelancer Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={freelancer.profilePicture || undefined} />
            <AvatarFallback className="bg-primary text-white text-lg">
              {freelancer.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-semibold text-lg text-charcoal truncate">
              {freelancer.name}
            </h3>
            {freelancer.specialty && (
              <p className="text-sm text-gray-600 mt-1">{freelancer.specialty}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {freelancer.rating !== undefined && freelancer.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {freelancer.rating.toFixed(1)}
                  </span>
                  {freelancer.reviews !== undefined && freelancer.reviews > 0 && (
                    <span className="text-xs text-gray-500">({freelancer.reviews})</span>
                  )}
                </div>
              )}
            </div>
            {freelancer.location && (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{freelancer.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>Available Dates</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {next14Days.map((date) => {
              const dateKey = formatDateKey(date);
              const available = isDateAvailable(date);
              const isToday = formatDateKey(new Date()) === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => available && onDateSelect(freelancer.id, dateKey)}
                  disabled={!available}
                  className={`
                    aspect-square text-xs font-medium rounded-md transition-all
                    ${
                      available
                        ? 'bg-green-100  text-green-800  hover:bg-green-200  cursor-pointer'
                        : 'bg-gray-100  text-gray-400  cursor-not-allowed'
                    }
                    ${isToday ? 'ring-2 ring-primary' : ''}
                  `}
                  title={available ? `Available on ${format(date, 'MMM d')}` : 'Not available'}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {availableDates.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">No available dates</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

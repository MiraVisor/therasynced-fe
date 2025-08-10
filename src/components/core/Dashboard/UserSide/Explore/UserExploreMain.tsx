'use client';

import { Calendar, CheckCircle, Clock, Clock as ClockIcon, Heart, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/redux/hooks/useAppHooks';
import {
  fetchAllFavoriteFreelancers,
  fetchExplorePatientBookings,
} from '@/redux/slices/exploreSlice';
import { fetchFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import ExpertCard from '../Overview/ExpertCard';

// Simple Stats Section
const StatsSection: React.FC<{ bookings: any[] }> = ({ bookings }) => {
  const totalSessions = bookings?.length || 0;
  const upcomingSessions =
    bookings?.filter((booking: any) => {
      const bookingDate = new Date(booking.slot?.startTime);
      const now = new Date();
      return bookingDate > now;
    }).length || 0;
  const completedSessions =
    bookings?.filter((booking: any) => {
      const bookingDate = new Date(booking.slot?.startTime);
      const now = new Date();
      return bookingDate < now;
    }).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {completedSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {upcomingSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Appointment Section with API Integration
const AppointmentSection: React.FC<{
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  bookings: any[];
  loading: boolean;
  getExpertName: (booking: any) => string;
  getBookingTime: (booking: any) => string;
  getBookingDuration: (booking: any) => string;
  getBookingLocation: (booking: any) => string;
}> = ({
  date,
  onDateChange,
  bookings,
  loading,
  getExpertName,
  getBookingTime,
  getBookingDuration,
  getBookingLocation,
}) => {
  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={onDateChange}
              className="rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
          {/* Appointments List */}
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {date
                  ? date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select a date'}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading
                  ? 'Loading appointments...'
                  : `${bookings.length} session${bookings.length !== 1 ? 's' : ''} scheduled`}
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <div
                    key={booking.id || index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-primary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {getExpertName(booking)}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {booking.status || 'Confirmed'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{getBookingTime(booking)}</span>
                      <span>•</span>
                      <span>{getBookingDuration(booking)}</span>
                      <span>•</span>
                      <span>{getBookingLocation(booking)}</span>
                    </div>
                    {booking?.totalAmount && (
                      <div className="text-sm font-medium text-primary mt-1">
                        €{booking.totalAmount}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="mb-3">No appointments scheduled</p>
                  <Button variant="outline" size="sm">
                    Book New Session
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Favorites Section with Responsive Carousel
const FavoritesSection: React.FC<{ favorites: Expert[]; loading: boolean }> = ({
  favorites,
  loading,
}) => {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="w-5 h-5 text-red-500" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="w-5 h-5 text-red-500" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Save your favorite experts for quick access
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Heart className="w-5 h-5 text-red-500" />
          Favorites
          {favorites.length > 1 && (
            <span className="text-sm font-normal text-gray-500">({favorites.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Carousel Container */}
          <div className="px-6 pb-6">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {favorites.map((expert) => (
                  <CarouselItem
                    key={expert.id}
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-full"
                  >
                    <div className="p-1">
                      <ExpertCard {...expert} showFavoriteText={false} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Arrows */}
              {favorites.length > 1 && (
                <>
                  <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:flex" />
                  <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:flex" />
                </>
              )}
            </Carousel>
          </div>

          {/* Interactive Indicators */}
          {favorites.length > 1 && (
            <div className="flex justify-center gap-1 mt-4 pb-4">
              {favorites.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === current ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UserExploreMain = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { favorites, loading, bookings, bookingsLoading } = useSelector(
    (state: RootState) => state.explore as any,
  );
  const { experts: allExperts } = useSelector((state: RootState) => state.overview);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Fetch data on component mount only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchAllFavoriteFreelancers() as any);
    dispatch(fetchFreelancers({ limit: 6 }) as any);
    // Fetch bookings for current date on mount - use timezone-safe formatting
    const currentDate = new Date();
    const formattedCurrentDate =
      currentDate.getFullYear() +
      '-' +
      String(currentDate.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(currentDate.getDate()).padStart(2, '0');
    dispatch(fetchExplorePatientBookings(formattedCurrentDate) as any);
  }, [dispatch, isAuthenticated]);

  // Helper function to format date safely without timezone issues
  const formatDateForAPI = (date: Date): string => {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  };

  // Handle date change with API integration
  const handleDateChange = async (newDate: Date | undefined) => {
    setDate(newDate);

    if (newDate && isAuthenticated) {
      setCalendarLoading(true);
      try {
        // Format date as YYYY-MM-DD for API using timezone-safe method
        const formattedDate = formatDateForAPI(newDate);
        // Dispatch API call for the selected date
        await dispatch(fetchExplorePatientBookings(formattedDate) as any);
      } catch (error) {
        console.error('Error fetching appointments for date:', error);
      } finally {
        setCalendarLoading(false);
      }
    }
  };

  // Process favorites data
  let favoritesList: Expert[] = [];
  if (favorites && favorites.length > 0) {
    favoritesList = favorites
      .map((favorite: Expert) => {
        if (!favorite?.cardInfo) return null;
        return {
          id: favorite.id ?? '',
          name: favorite.cardInfo.name ?? '',
          specialty: favorite.cardInfo.mainService ?? '',
          yearsOfExperience: favorite.cardInfo.yearsOfExperience ?? 'N/A',
          rating: favorite.cardInfo.averageRating ?? 0,
          reviews: favorite.cardInfo.patientStories ?? 0,
          description:
            favorite.description ?? favorite.cardInfo.title ?? 'No description available',
          isFavorite: !!favorite.isFavorite,
          services: favorite.services || [],
          location: favorite.city || favorite.cardInfo.country || 'Online',
          languages: favorite.languages || ['English'],
          sessionTypes: favorite.sessionTypes || ['online', 'office'],
          pricing: favorite.pricing,
          availableSlots: favorite.slotSummary?.availableSlots || favorite.availableSlots || 0,
          totalSlots: favorite.slotSummary?.totalSlots || 0,
          nextAvailableSlot: favorite.slotSummary?.nextAvailable || favorite.nextAvailableSlot,
          cardInfo: favorite.cardInfo,
          profilePicture: favorite.profilePicture,
          email: favorite.email,
          gender: favorite.gender,
          city: favorite.city,
          isEmailVerified: favorite.isEmailVerified,
          isActive: favorite.isActive,
          authProvider: favorite.authProvider,
          slots: favorite.slots || [],
        };
      })
      .filter(Boolean);
  }

  // Fallback to overview experts
  if (favoritesList.length === 0 && allExperts && allExperts.length > 0) {
    favoritesList = allExperts
      .filter((expert: any) => expert.isFavorite)
      .slice(0, 3) as unknown as Expert[];
  }

  // Process bookings data
  const allBookings = bookings?.data || bookings || [];
  const bookingData = allBookings.filter((booking: any) => {
    if (!date || !booking?.slot?.startTime) return false;
    const bookingDate = new Date(booking.slot.startTime);
    const selectedDate = new Date(date);
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    );
  });

  // Helper functions
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getExpertName = (booking: any) => {
    return booking?.slot?.freelancer?.name || booking?.expertName;
  };

  const getBookingTime = (booking: any) => {
    return booking?.slot?.startTime ? formatTime(booking.slot.startTime) : '';
  };

  const getBookingDuration = (booking: any) => {
    return booking?.slot?.duration ? `${booking.slot.duration} min` : '';
  };

  const getBookingLocation = (booking: any) => {
    return booking?.slot?.locationType === 'OFFICE'
      ? 'Office'
      : booking?.slot?.location === 'ONLINE'
        ? 'Online'
        : booking?.slot?.location === 'HOME'
          ? 'Home'
          : 'Virtual';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s your health journey overview
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Section */}
        <StatsSection bookings={allBookings} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Favorites Section */}
          <div className="xl:col-span-1">
            <FavoritesSection favorites={favoritesList} loading={loading} />
          </div>

          {/* Schedule Section */}
          <div className="xl:col-span-2">
            <AppointmentSection
              date={date}
              onDateChange={handleDateChange}
              bookings={bookingData}
              loading={calendarLoading || bookingsLoading}
              getExpertName={getExpertName}
              getBookingTime={getBookingTime}
              getBookingDuration={getBookingDuration}
              getBookingLocation={getBookingLocation}
            />
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;

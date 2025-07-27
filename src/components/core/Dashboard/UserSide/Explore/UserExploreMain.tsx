'use client';

import { ArrowRight, Calendar, Clock, Heart, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchExplorePatientBookings,
  fetchRecentFavoriteFreelancer,
} from '@/redux/slices/exploreSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';

// Simple Favorite Expert Card
const FavoriteExpertCard: React.FC<{ expert?: Expert; loading: boolean }> = ({
  expert,
  loading,
}) => {
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expert) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              No Favorites Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Save your favorite experts for quick access
            </p>
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Explore Experts
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Favorite Expert</h3>
          <Button variant="ghost" size="sm">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </Button>
        </div>

        {/* Expert Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">{expert.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {expert.name}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{expert.specialty}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < expert.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({expert.rating}.0)</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
          {expert.description}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {expert.experience} years
          </Badge>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Book Session
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Appointment Section
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
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Today&apos;s Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="space-y-4 ">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={onDateChange}
              className="rounded-md border w-full"
            />
          </div>

          {/* Appointments List */}
          <div className="flex flex-col h-full">
            {/* Simple Stats */}
            <div className="grid grid-cols-1 gap-3 w-full mb-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary">{bookings.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Today&apos;s Sessions
                </div>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming Sessions</h4>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
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
                <div className="space-y-3 h-96">
                  {bookings.map((booking, index) => (
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
                        <span>•</span>
                        <span>€{booking?.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No appointments scheduled for this date</p>
                  <Button variant="outline" size="sm" className="mt-3">
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

// Simple Health Summary Section
const StatsSection: React.FC<{ bookings: any[] }> = ({ bookings }) => {
  // Calculate stats from bookings data
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
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          Your Session Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{totalSessions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">All your booked sessions</div>
          </div>

          {/* Completed Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sessions you&apos;ve attended
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{upcomingSessions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions scheduled ahead</div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="h-auto p-4 flex items-center gap-2 bg-white dark:bg-gray-800"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Book New Session</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const UserExploreMain = () => {
  const dispatch = useDispatch();
  const { favorite, loading, bookings, bookingsLoading } = useSelector(
    (state: RootState) => state.explore as any,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fetch favorite expert
  useEffect(() => {
    dispatch(fetchRecentFavoriteFreelancer() as any);
  }, [dispatch]);

  // Fetch all bookings once on component mount
  useEffect(() => {
    dispatch(fetchExplorePatientBookings() as any);
  }, [dispatch]);

  // Handle date change from calendar
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  // Map API response to Expert type
  const expertCardProps: Expert | undefined = favorite?.cardInfo
    ? {
        id: favorite.id ?? '',
        name: favorite.cardInfo.name ?? '',
        specialty: favorite.cardInfo.mainService ?? '',
        experience: favorite.cardInfo.yearsOfExperience ?? '',
        rating: favorite.cardInfo.averageRating ?? 0,
        description: favorite.cardInfo.title ?? '',
        isFavorite: !!favorite.isFavorite,
      }
    : undefined;

  // Handle booking data - properly map the API response structure
  const allBookings = bookings?.data || bookings || [];

  // Filter bookings by selected date
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

  // Helper function to format time from ISO string
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper function to get expert name from booking
  const getExpertName = (booking: any) => {
    return booking?.slot?.freelancer?.name || booking?.expertName;
  };

  // Helper function to get booking time
  const getBookingTime = (booking: any) => {
    return booking?.slot?.startTime ? formatTime(booking.slot.startTime) : '';
  };

  // Helper function to get booking duration
  const getBookingDuration = (booking: any) => {
    return booking?.slot?.duration ? `${booking.slot.duration} min` : '';
  };

  // Helper function to get booking location
  const getBookingLocation = (booking: any) => {
    return booking?.slot?.locationType === 'OFFICE'
      ? 'Office'
      : booking?.slot?.location === 'ONLINE'
        ? 'Online'
        : booking?.slot?.location === 'HOME'
          ? 'Home'
          : 'Virtual';
  };

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your health journey today
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Grid */}
        {/* Stats Section */}
        <StatsSection bookings={allBookings} />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Favorite Expert Section */}
          <div className="xl:col-span-1">
            <FavoriteExpertCard expert={expertCardProps} loading={loading} />
          </div>

          {/* Appointment Section */}
          <div className="xl:col-span-2">
            <AppointmentSection
              date={date}
              onDateChange={handleDateChange}
              bookings={bookingData}
              loading={bookingsLoading}
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

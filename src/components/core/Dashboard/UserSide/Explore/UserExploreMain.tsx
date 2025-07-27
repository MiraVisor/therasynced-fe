'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  fetchExplorePatientBookings,
  fetchRecentFavoriteFreelancer,
} from '@/redux/slices/exploreSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { AppointmentCard } from './AppointmentCard';
import MessageSection from './MessageSection';

// Create a modern FavoriteExpertCard component

// Remove Card usage for FavoriteExpertCard and make it a simple, responsive, centered section
const FavoriteExpertSection: React.FC<{ expert?: Expert; loading: boolean }> = ({
  expert,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }
  if (!expert) {
    return (
      <section className="flex flex-col items-center justify-center w-full py-8">
        <h2 className="text-xl font-bold mb-2 text-center">Your Favorite Expert</h2>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="text-2xl">💙</span>
        </div>
        <p className="text-gray-500 text-center">No favorites yet</p>
        <p className="text-sm text-gray-400 text-center mt-2">
          Start exploring and add your favorite experts
        </p>
      </section>
    );
  }
  return (
    <section className="flex flex-col items-center justify-center w-full py-8">
      <h2 className="text-xl font-bold mb-2 text-center">Your Favorite Expert</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
            {expert.name.charAt(0)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex flex-col items-start">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{expert.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{expert.specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
              {expert.yearsOfExperience} years
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < expert.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-500 ml-1">({expert.rating})</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center max-w-md mb-4">
        {expert.description}
      </p>
      <Button className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white">
        Book Appointment
      </Button>
    </section>
  );
};

const UserExploreMain = () => {
  const dispatch = useDispatch();
  const { favorite, loading, bookings } = useSelector((state: RootState) => state.explore as any);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    dispatch(fetchRecentFavoriteFreelancer() as any);
  }, [dispatch]);

  useEffect(() => {
    if (date) {
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      dispatch(fetchExplorePatientBookings(formatDate(date)) as any);
    }
  }, [dispatch, date]);

  // Map API response to ExpertCard props
  const expertCardProps: Expert | undefined = favorite?.cardInfo
    ? {
        id: favorite.id ?? '',
        name: favorite.cardInfo.name ?? '',
        specialty: favorite.cardInfo.mainService ?? '',
        yearsOfExperience: favorite.cardInfo.yearsOfExperience ?? '',
        rating: favorite.cardInfo.averageRating ?? 0,
        description: favorite.cardInfo.title ?? '',
        isFavorite: !!favorite.isFavorite,
      }
    : undefined;

  const handleSendMessage = () => {
    // Implement send message logic
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome back, ! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Here&apos;s what&apos;s happening today and your upcoming appointments
          </p>
        </div>
      }
    >
      <div className="flex flex-col items-center w-full px-2 sm:px-6 lg:px-0 max-w-3xl mx-auto space-y-8">
        {/* Favorite Expert Section - Centered and Responsive */}
        <FavoriteExpertSection expert={expertCardProps} loading={loading} />
        {/* Appointment Section - keep as is for now, but can be refactored similarly if needed */}
        <div className="w-full">
          <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Schedule & Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <AppointmentCard
                    date={date}
                    bookings={Array.isArray(bookings) ? bookings : bookings?.data || []}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Messages Section - keep as is for now */}
        <div className="w-full">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Messages
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Stay connected with your favorite experts
              </p>
            </CardHeader>
            <CardContent>
              {expertCardProps ? (
                <MessageSection expert={expertCardProps} onSendMessage={handleSendMessage} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Add a favorite expert to start messaging and stay connected with your healthcare
                    providers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;

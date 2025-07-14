import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DotLoader from '@/components/common/DotLoader';
import NotFound from '@/components/common/NotFound';
import { Calendar } from '@/components/ui/calendar';
import {
  fetchExplorePatientBookings,
  fetchRecentFavoriteFreelancer,
} from '@/redux/slices/exploreSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import ExpertCard from '../Overview/ExpertCard';
import { AppointmentCard } from './AppointmentCard';
import MessageSection from './MessageSection';

const UserExploreMain = () => {
  const dispatch = useDispatch();
  const { favorite, loading, bookings, bookingsLoading } = useSelector(
    (state: RootState) => state.explore as any,
  );
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    dispatch(fetchRecentFavoriteFreelancer() as any);
  }, [dispatch]);

  useEffect(() => {
    console.log('Redux bookings state:', bookings);
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
        experience: favorite.cardInfo.yearsOfExperience ?? '',
        rating: favorite.cardInfo.averageRating ?? 0,
        description: favorite.cardInfo.title ?? '',
        isFavorite: !!favorite.isFavorite,
      }
    : undefined;

  const handleReschedule = () => {
    // Implement reschedule logic
  };

  const handleCancel = () => {
    // Implement cancel logic
  };

  const handleSendMessage = () => {
    // Implement send message logic
  };

  return (
    <DashboardPageWrapper
      header={
        <h2 className="text-xl font-semibold">
          Hi Nadeem! 👋{' '}
          <span className="text-green-600">Here&apos;s what&apos;s happening today.</span>
        </h2>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Top Grid: Favorite + Appointment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Favorite Expert Section */}
          <section className="lg:col-span-4">
            {loading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <DotLoader size={14} />
                <span className="mt-2 text-gray-500 text-sm">Loading favorite...</span>
              </div>
            ) : expertCardProps ? (
              <ExpertCard {...expertCardProps} showFavoriteText={true} />
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[250px]">
                <NotFound message="No favorites yet" />
              </div>
            )}
          </section>

          {/* Appointment Section */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-md border border-gray-100 dark:border-gray-700 h-[410px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="flex items-center justify-center h-full" style={{ width: '90%' }}>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-xl h-full w-full"
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
                {/* Appointment details card (AppointmentCard) takes the rest of the space */}
                <div className="h-full flex-1">
                  <AppointmentCard
                    date={date}
                    bookings={Array.isArray(bookings) ? bookings : bookings?.data || []}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Messages Section */}
        {/* <section className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-6">Messages</h3>
            {expertCardProps ? (
              <MessageSection/>
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[150px]">
                <NotFound message="No favorite expert to message" />
              </div>
            )}
          </div>
        </section> */}
      </div>
    </DashboardPageWrapper>
  );
};

export default UserExploreMain;

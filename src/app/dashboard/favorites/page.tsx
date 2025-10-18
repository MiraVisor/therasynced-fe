'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { fetchAllFavoriteFreelancers } from '@/redux/slices/exploreSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../../components/core/Dashboard/DashboardPageWrapper';
import ExpertCard from '../../../components/core/Dashboard/UserSide/Overview/ExpertCard';

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { favorites, loading } = useSelector((state: RootState) => state.explore as any);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchAllFavoriteFreelancers() as any);
  }, [dispatch, isAuthenticated]);

  // Process favorites data
  const favoritesList =
    favorites?.map((favorite: Expert) => {
      return {
        ...favorite,
        verificationStatus: favorite.verificationStatus,
      };
    }) || [];

  if (loading) {
    return (
      <DashboardPageWrapper
        userRole="PATIENT"
        header={
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
            <p className="text-gray-600 dark:text-gray-400">Your saved therapists</p>
          </div>
        }
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      userRole="PATIENT"
      header={
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {favoritesList.length === 0
              ? 'No favorites yet'
              : `${favoritesList.length} saved therapist${favoritesList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      }
    >
      {favoritesList.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-3xl">❤️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Start exploring therapists and add them to your favorites to see them here.
          </p>
          <a
            href="/dashboard/explore"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Explore Therapists
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritesList.map((therapist: Expert) => (
            <ExpertCard key={therapist.id} {...therapist} showFavoriteText={false} />
          ))}
        </div>
      )}
    </DashboardPageWrapper>
  );
};

export default FavoritesPage;

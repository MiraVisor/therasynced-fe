'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { fetchFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { SearchBar } from '../../SearchBar';
import { ExpertList } from './ExpertSection';

const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name,
    specialty: freelancer.specialty || 'N/A',
    yearsOfExperience: freelancer.yearsOfExperience || 'N/A',
    rating: freelancer.rating || 0,
    description: freelancer.description || 'No description',
    isFavorite: freelancer.isFavorite ?? false,
  };
};

const UserOverview = () => {
  const dispatch = useDispatch();
  const { experts, loading, error } = useSelector((state: RootState) => state.overview);

  useEffect(() => {
    dispatch(fetchFreelancers() as any);
  }, [dispatch]);

  const mappedExperts = experts.map(mapFreelancerToExpert);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full m">
      <DashboardPageWrapper
        header={
          <div className="w-full">
            <h1 className="text-4xl font-extrabold ">Find Your Perfect Expert</h1>
            <p className="text-lg mb-6 max-w-2xl">
              Discover qualified healthcare professionals ready to help you
            </p>
            <div className="w-full max-w-2xl flex flex-col items-center gap-4">
              <SearchBar isLocationEnabled />
            </div>
          </div>
        }
      >
        <main className="w-full ">
          {/* Section Header for Experts List */}
          {/* <section className="w-full flex flex-col items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Featured Healthcare Experts
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-2xl">
              Connect with qualified professionals who are ready to help you on your wellness
              journey
            </p>
          </section> */}
          {/* Experts List or Loading/Error States */}
          <section className="w-full">
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 w-full">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="w-full ">
                <ExpertList experts={mappedExperts} />
              </div>
            )}
          </section>
          {/* View More Button */}
          <div className="w-full flex justify-center mt-10">
            <Button className="">View More Experts</Button>
          </div>
        </main>
      </DashboardPageWrapper>
    </div>
  );
};

export default UserOverview;

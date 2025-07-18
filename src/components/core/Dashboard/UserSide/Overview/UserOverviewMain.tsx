'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFreelancers } from '@/redux/slices/overviewSlice';
import { RootState } from '@/redux/store';
import { Expert } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import { SearchBar } from '../../SearchBar';
import { ExpertList } from './ExpertSection';
import { SectionHeader } from './SectionHeader';
import { ViewMoreButton } from './ViewMoreButton';

const mapFreelancerToExpert = (freelancer: any): Expert => {
  // Map API freelancer to Expert type for UI
  return {
    id: freelancer.id,
    name: freelancer.name,
    specialty: freelancer.services?.[0]?.name || 'N/A',
    experience:
      freelancer.services?.length > 0
        ? `${freelancer.services.length} Service${freelancer.services.length > 1 ? 's' : ''}`
        : 'N/A',
    rating: 4, // Placeholder, update if rating is available in API
    description: freelancer.description || 'No description',
    isFavorite: freelancer.isFavorite ?? false, // Use isFavorited from API
  };
};

const UserOverview = () => {
  const dispatch = useDispatch();
  const { experts, loading, error } = useSelector((state: RootState) => state.overview);

  useEffect(() => {
    dispatch(fetchFreelancers() as any);
  }, [dispatch]);

  const mappedExperts = experts.map(mapFreelancerToExpert);

  return (
    <DashboardPageWrapper header={<SearchBar isLocationEnabled />}>
      <SectionHeader />
      {loading ? (
        <div className="py-8 text-center">Loading experts...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <ExpertList experts={mappedExperts} />
      )}
      <ViewMoreButton />
    </DashboardPageWrapper>
  );
};

export default UserOverview;

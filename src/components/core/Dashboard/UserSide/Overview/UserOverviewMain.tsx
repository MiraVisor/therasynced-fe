import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DotLoader from '@/components/common/DotLoader';
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
    rating: freelancer.cardInfo?.averageRating ?? 0,
    description: freelancer.description || 'No description',
    isFavorite: freelancer.isFavorite ?? false, // Use isFavorited from API
    imageUrl: freelancer.profilePicture || undefined,
  };
};

const UserOverview = () => {
  const dispatch = useDispatch();
  const { experts, loading, error, total } = useSelector((state: RootState) => state.overview);
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    const params = {
      page,
      limit,
    };
    dispatch(fetchFreelancers(params) as any);
  }, [dispatch, page]);

  const mappedExperts = experts.map(mapFreelancerToExpert);

  const handleViewMore = () => {
    setPage((prev) => prev + 1);
  };

  const showViewMore = experts.length < total;

  return (
    <DashboardPageWrapper header={<SearchBar isLocationEnabled />}>
      <SectionHeader />
      {loading && page === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <DotLoader size={14} />
          <span className="mt-2 text-gray-500 text-sm">Loading experts...</span>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
      ) : (
        <ExpertList experts={mappedExperts} />
      )}
      {showViewMore && <ViewMoreButton onClick={handleViewMore} />}
    </DashboardPageWrapper>
  );
};

export default UserOverview;

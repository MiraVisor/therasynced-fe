'use client';

import { useQueries } from '@tanstack/react-query';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import FavoriteFreelancerCard from '@/components/core/Dashboard/UserSide/Home/FavoriteTherapistCard';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { usePatientStamps } from '@/hooks/queries/useLoyalty';
import { getFreelancerById } from '@/services/freelancerService';
import { Expert } from '@/types/types';

export default function LoyaltyPage() {
  const { data: stampSummaries = [], isLoading, error } = usePatientStamps();

  // Fetch freelancer details for each therapist to get presigned URLs
  const freelancerQueries = useQueries({
    queries: stampSummaries.map((stamp) => ({
      queryKey: ['freelancer', stamp.therapist.id],
      queryFn: async () => {
        const response = await getFreelancerById(stamp.therapist.id);
        return response.data;
      },
      enabled: !!stamp.therapist.id,
      staleTime: 60 * 60 * 1000, // 1 hour - same as presigned URL expiry
    })),
  });

  // Create a map of freelancer IDs to their profile pictures (presigned URLs)
  const profilePictureMap = new Map<string, string | null>();
  freelancerQueries.forEach((query, index) => {
    if (query.data?.profile?.profilePicture) {
      const therapistId = stampSummaries[index]?.therapist.id;
      if (therapistId) {
        profilePictureMap.set(therapistId, query.data.profile.profilePicture);
      }
    }
  });

  // Convert TherapistStampSummary to Expert format for FavoriteFreelancerCard
  // Use presigned URLs from freelancer details if available
  const experts: Expert[] = stampSummaries.map((stamp) => {
    // Get presigned URL from freelancer details, fallback to stamp data
    const presignedUrl =
      profilePictureMap.get(stamp.therapist.id) || stamp.therapist.profilePicture;

    return {
      id: stamp.therapist.id,
      name: stamp.therapist.name,
      specialty: 'Therapist', // Default since not in stamp summary
      jobTitle: undefined,
      rating: undefined,
      reviews: 0,
      description: '',
      isFavorite: true, // These are stamp holders, so they're likely favorites
      profilePicture: presignedUrl || undefined,
      services: [],
      location: undefined,
      sessionTypes: undefined,
      verificationStatus: 'unverified', // Default since not in stamp summary
      firstAidCertificateStatus: undefined,
      cardInfo: {
        name: stamp.therapist.name,
        totalRatings: 0,
        averageRating: undefined,
      },
      availableSlots: 0,
      totalSlots: 0,
      stampInfo: {
        currentStampCount: stamp.currentStampCount,
        stampTarget: stamp.stampTarget,
        stampsRemaining: stamp.stampsRemaining,
        rewardReady: stamp.rewardReady,
        rewardReserved: stamp.rewardReserved || false,
        discountPercentage: stamp.discountPercentage,
        customConfigApplied: stamp.customConfigApplied || false,
      },
    };
  });

  // Check if any freelancer queries are still loading
  const isLoadingFreelancers = freelancerQueries.some((query) => query.isLoading);

  if (isLoading || isLoadingFreelancers) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-poppins font-bold text-gray-900">Freelancer Stamps</h1>
            <p className="text-gray-600 font-inter">Track your stamp progress with freelancers</p>
          </div>
        }
      >
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </DashboardPageWrapper>
    );
  }

  if (error) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-poppins font-bold text-gray-900">Freelancer Stamps</h1>
            <p className="text-gray-600 font-inter">Track your stamp progress with freelancers</p>
          </div>
        }
      >
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-600">
              <p>Error loading stamps: {error instanceof Error ? error.message : String(error)}</p>
            </div>
          </CardContent>
        </Card>
      </DashboardPageWrapper>
    );
  }

  if (!stampSummaries || stampSummaries.length === 0) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-poppins font-bold text-gray-900">Freelancer Stamps</h1>
            <p className="text-gray-600 font-inter">Track your stamp progress with freelancers</p>
          </div>
        }
      >
        <Card>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>You don&apos;t have any stamps yet.</p>
              <p className="text-sm mt-2">
                Book appointments with freelancers to start earning stamps!
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="text-3xl font-poppins font-bold text-gray-900">Freelancer Stamps</h1>
          <p className="text-gray-600 font-inter">Track your stamp progress with freelancers</p>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Stamps</h2>
          <p className="text-sm text-gray-600">
            {stampSummaries.length} freelancer{stampSummaries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <FavoriteFreelancerCard key={expert.id} freelancer={expert} />
          ))}
        </div>
      </div>
    </DashboardPageWrapper>
  );
}

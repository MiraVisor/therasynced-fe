import { useState } from 'react';

import { Expert, SubscriptionPlanType } from '@/types/types';

import { ExpertCardContent } from './ExpertCardContent';
import { ExpertProfileDialog } from './ExpertProfileDialog';

interface ExpertCardProps extends Expert {
  showFavoriteText?: boolean;
  imageUrl?: string;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  firstAidCertificateStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  tier?: SubscriptionPlanType | null;
}

const ExpertCard: React.FC<ExpertCardProps> = ({
  id,
  name,
  specialty,
  jobTitle,
  rating,
  description,
  isFavorite = false,
  showFavoriteText = false,
  services = [],
  location = 'Online',
  sessionTypes = ['online', 'office'],
  pricing,
  availableSlots,
  cardInfo,
  slots = [],
  verificationStatus = 'unverified',
  firstAidCertificateStatus,
  tier,
  planFeatures,
  stampInfo,
}) => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleBookNow = () => {
    // This will be handled by ExpertCardContent
  };

  const hasAvailableSlots = slots && slots.length > 0;

  return (
    <>
      <ExpertCardContent
        id={id}
        name={name}
        rating={rating}
        isFavorite={isFavorite}
        showFavoriteText={showFavoriteText}
        services={services}
        availableSlots={availableSlots}
        cardInfo={cardInfo}
        slots={slots}
        verificationStatus={verificationStatus}
        tier={tier}
        planFeatures={planFeatures}
        stampInfo={stampInfo}
        onViewProfile={() => setShowProfileDialog(true)}
      />
      <ExpertProfileDialog
        isOpen={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        expert={{
          id,
          name,
          specialty,
          jobTitle,
          rating,
          description,
          isFavorite,
          services,
          location,
          sessionTypes,
          pricing,
          availableSlots,
          cardInfo,
          verificationStatus,
          firstAidCertificateStatus,
          onBookNow: handleBookNow,
          hasAvailableSlots,
          stampInfo: stampInfo || undefined,
        }}
      />
    </>
  );
};

export default ExpertCard;

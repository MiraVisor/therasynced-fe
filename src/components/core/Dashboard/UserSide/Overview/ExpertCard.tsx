import { Calendar, CheckCircle, Heart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { favoriteFreelancer } from '@/redux/slices/overviewSlice';
import { Expert } from '@/types/types';

interface ExpertCardProps extends Expert {
  showFavoriteText?: boolean;
  imageUrl?: string;
}

const ExpertCard: React.FC<ExpertCardProps> = ({
  id,
  name,
  specialty,
  yearsOfExperience,
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
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleBookNow = () => {
    // Pass freelancer data through route state to avoid loading issues
    const freelancerData = {
      id,
      name,
      specialty,
      yearsOfExperience,
      rating,
      description,
      isFavorite,
      services,
      location,
      sessionTypes,
      pricing,
      availableSlots,
      cardInfo,
    };

    router.push(
      `/dashboard/freelancer/${id}?data=${encodeURIComponent(JSON.stringify(freelancerData))}`,
    );
  };

  const handleViewProfile = () => {
    setShowProfileDialog(true);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await dispatch(favoriteFreelancer(id) as any).unwrap();
      if (result && typeof result === 'object' && 'favorited' in result) {
        toast.success(result.favorited ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.success(!isFavorite ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (err: any) {
      toast.error('Failed to update favorite');
    }
  };

  // Get the lowest price for quick display

  // Check if we have a valid price to display

  // Get session type icons

  // Get freelancer info from the available props
  const freelancerName = name || cardInfo?.name || 'Unknown';

  return (
    <>
      <Card className="group  transition-all duration-300 border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:border-primary/30 h-full flex flex-col">
        <CardHeader className="pb-3 px-4">
          {showFavoriteText && (
            <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
              Your <span className="text-primary">Favorites</span>
            </h3>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 rounded-full border-2 border-primary group-hover:border-primary/40 transition-colors flex-shrink-0">
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {freelancerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1 truncate transition-colors">
                  {freelancerName}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">({rating?.toFixed(1)})</span>
                </div>
              </div>
            </div>

            <button
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              onClick={handleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4 px-4 flex-1 flex flex-col">
          {/* Price and Actions */}
          <div className="mt-auto space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 border-primary text-primary  h-9 text-sm"
                onClick={handleViewProfile}
              >
                View Profile
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm h-9 text-sm"
                onClick={handleBookNow}
              >
                Book Now
                <Calendar className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-[95vw] lg:max-w-2xl max-h-[90vh] lg:max-h-[80vh] overflow-y-auto mx-4 lg:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
              {name}&apos;s Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 lg:space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
              <Avatar className="w-16 h-16 lg:w-12 lg:h-12 rounded-full border-2 border-primary mx-auto lg:mx-0">
                <AvatarFallback className="text-2xl lg:text-2xl font-semibold bg-primary/10 text-primary">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{specialty}</p>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-xs lg:text-sm">
                  <div className="flex items-center justify-center lg:justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 lg:w-4 lg:h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-gray-600 font-medium">({rating?.toFixed(1)})</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-4">
                    <span className="text-gray-500 hidden lg:inline">•</span>
                    <span className="text-gray-600">{yearsOfExperience}</span>
                    {cardInfo?.patientStories && (
                      <>
                        <span className="text-gray-500 hidden lg:inline">•</span>
                        <span className="text-gray-600">{cardInfo.patientStories} reviews</span>
                      </>
                    )}
                  </div>
                </div>
                {(availableSlots || 0) > 0 && (
                  <div className="mt-2 flex items-center justify-center lg:justify-start gap-1 text-xs lg:text-sm text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>{availableSlots || 0} slots available</span>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm lg:text-base">
                About
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm lg:text-base">
                  Services
                </h4>
                <div className="space-y-2 lg:space-y-3">
                  {services.slice(0, 4).map((service: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg ">
                      <div className="flex items-center justify-between mb-1">
                        <span className=" text-xs lg:text-sm">{service.name}</span>
                      </div>
                      {service.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{service.description}</p>
                      )}
                      {service.locationTypes && service.locationTypes.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {service.locationTypes.map((type: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type === 'VIRTUAL'
                                ? 'Online'
                                : type === 'OFFICE'
                                  ? 'Office'
                                  : type === 'HOME'
                                    ? 'Home'
                                    : type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-10 lg:h-11 text-sm border-primary text-primary hover:bg-primary/5 hover:border-primary/40"
                onClick={() => setShowProfileDialog(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 h-10 lg:h-11 text-sm"
                onClick={() => {
                  setShowProfileDialog(false);
                  handleBookNow();
                }}
              >
                Book Session
                <Calendar className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpertCard;

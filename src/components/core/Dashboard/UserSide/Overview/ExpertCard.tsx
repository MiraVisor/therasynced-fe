import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Home,
  MapPin,
  Star,
  User,
  Video,
} from 'lucide-react';
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
  languages = ['English'],
  sessionTypes = ['online', 'office'],
  pricing,
  availableSlots,
  cardInfo,
  nextAvailableSlot,
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
      languages,
      sessionTypes,
      pricing,
      availableSlots,
      cardInfo,
      nextAvailableSlot,
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
  const getLowestPrice = () => {
    // Check if we have services with pricing
    if (services && services.length > 0) {
      const servicePrices = services
        .map((service) => service.additionalPrice || service.price || service.basePrice)
        .filter((price) => price !== null && price !== undefined && price > 0);

      if (servicePrices.length > 0) {
        return Math.min(...servicePrices);
      }
    }

    // Fallback to pricing object if no services with prices
    if (pricing) {
      const prices = [pricing.online?.min, pricing.office?.min, pricing.home?.min].filter(Boolean);
      return prices.length > 0 ? Math.min(...prices) : 'N/A';
    }

    // If no pricing information available at all, return N/A
    return 'N/A';
  };

  // Check if we have a valid price to display
  const hasValidPrice = () => {
    const price = getLowestPrice();
    return price !== 'N/A' && typeof price === 'number';
  };

  // Get session type icons
  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'office':
        return <Building className="w-4 h-4" />;
      case 'home':
        return <Home className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  // Get freelancer info from the available props
  const freelancerName = name || cardInfo?.name || 'Unknown';
  const freelancerSpecialty =
    services?.[0]?.name || cardInfo?.mainService || specialty || 'General';
  const freelancerDescription = description || 'No description available.';

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:border-primary/30 h-full flex flex-col">
        <CardHeader className="pb-4 lg:pb-6 px-4 lg:px-6">
          {showFavoriteText && (
            <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-900 dark:text-white">
              Your <span className="text-primary">Favorites</span>
            </h3>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 lg:gap-5 flex-1 min-w-0">
              <Avatar className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-primary/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
                <AvatarFallback className="text-lg lg:text-xl font-semibold bg-primary/10 text-primary">
                  {freelancerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-2 lg:space-y-3">
                <div>
                  <h4 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-1 lg:mb-2 truncate group-hover:text-primary transition-colors">
                    {freelancerName}
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <User className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="truncate">{freelancerSpecialty}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 lg:w-4 lg:h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600 font-medium">
                      ({rating?.toFixed(1)})
                    </span>
                    {cardInfo?.patientStories && (
                      <span className="text-xs lg:text-sm text-gray-500 hidden lg:inline">
                        • {cardInfo.patientStories} reviews
                      </span>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs lg:text-sm bg-primary/10 text-primary border-primary/20 px-2 lg:px-3 py-1"
                  >
                    {yearsOfExperience}
                  </Badge>
                </div>
              </div>
            </div>

            <button
              className={`p-2 lg:p-3 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              onClick={handleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 lg:w-6 lg:h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 lg:pb-6 px-4 lg:px-6 flex-1 flex flex-col">
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-4 lg:mb-6 line-clamp-3 leading-relaxed">
            {freelancerDescription}
          </p>

          {/* Quick Info Row */}
          <div className="flex items-center justify-between text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-4 lg:mb-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="truncate max-w-[80px] lg:max-w-none">
                {cardInfo?.country || location}
              </span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="font-medium text-green-600 dark:text-green-400">
                {availableSlots || 0} slots
              </span>
            </div>
          </div>

          {/* Session Types */}
          {sessionTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 lg:gap-2 mb-4 lg:mb-6">
              {sessionTypes.slice(0, 2).map((type, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs lg:text-sm"
                >
                  {getSessionTypeIcon(type)}
                  <span className="capitalize font-medium hidden lg:inline">{type}</span>
                  <span className="capitalize font-medium lg:hidden">{type.charAt(0)}</span>
                </div>
              ))}
              {sessionTypes.length > 2 && (
                <div className="px-2 lg:px-3 py-1.5 lg:py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs lg:text-sm text-gray-500">
                  +{sessionTypes.length - 2}
                </div>
              )}
            </div>
          )}

          {/* Price and Actions */}
          <div className="mt-auto space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1 lg:gap-2">
                {hasValidPrice() ? (
                  <>
                    <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      €{getLowestPrice()}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-500">per session</span>
                  </>
                ) : (
                  <span className="text-lg lg:text-xl font-medium text-gray-500 dark:text-gray-400">
                    Price on request
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 lg:gap-3">
              <Button
                variant="outline"
                className="flex-1 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 h-9 lg:h-11 text-xs lg:text-sm"
                onClick={handleViewProfile}
              >
                <span className="hidden lg:inline">View Profile</span>
                <span className="lg:hidden">Profile</span>
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-sm h-9 lg:h-11 text-xs lg:text-sm"
                onClick={handleBookNow}
              >
                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Book Now</span>
                <span className="lg:hidden">Book</span>
              </Button>
            </div>

            {/* Availability Badge */}
            {(availableSlots || 0) > 0 && (
              <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg">
                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="font-medium">Available today</span>
              </div>
            )}
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
              <Avatar className="w-16 h-16 lg:w-12 lg:h-12 rounded-full border-2 border-primary/20 mx-auto lg:mx-0">
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
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs lg:text-sm">{service.name}</span>
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

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm lg:text-base">
                  Languages
                </h4>
                <div className="flex gap-1 lg:gap-2">
                  {languages.map((lang: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Next Available Slot */}
            {nextAvailableSlot && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm lg:text-base">
                  Next Available
                </h4>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 lg:p-3 border border-green-200 dark:border-green-800">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-green-800 dark:text-green-200">
                        {new Date(nextAvailableSlot.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {new Date(nextAvailableSlot.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}{' '}
                        -{' '}
                        {new Date(nextAvailableSlot.endTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 self-start lg:self-auto"
                    >
                      Available
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 h-10 lg:h-11 text-sm"
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
                <Calendar className="w-4 h-4 mr-2" />
                Book Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpertCard;

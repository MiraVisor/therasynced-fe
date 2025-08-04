import { Calendar, Clock, Heart, MapPin, Star, User } from 'lucide-react';
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
  experience,
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
    router.push(`/dashboard/freelancer/${id}`);
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

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-100 dark:border-gray-700 overflow-hidden">
        <CardHeader className="pb-4">
          {showFavoriteText && (
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Your <span className="text-primary">Favorites</span>
            </h3>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-full border-2 border-primary/20">
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {specialty}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {experience}
                </Badge>
              </div>
            </div>

            <button
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              onClick={handleFavorite}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{availableSlots || 0} slots available</span>
            </div>
            {cardInfo?.patientStories && (
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{cardInfo.patientStories} reviews</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-primary/20 text-primary hover:bg-primary/5"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={handleBookNow}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {name}&apos;s Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 rounded-full border-2 border-primary/20">
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{specialty}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-gray-600">({rating.toFixed(1)})</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{experience}</span>
                  {cardInfo?.patientStories && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{cardInfo.patientStories} reviews</span>
                    </>
                  )}
                </div>
                {availableSlots && availableSlots > 0 && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    {availableSlots} slots available
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Services</h4>
                <div className="space-y-3">
                  {services.slice(0, 4).map((service: any, index: number) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{service.name}</span>
                        <span className="text-sm text-gray-600">€{service.additionalPrice}</span>
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
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Languages</h4>
                <div className="flex gap-2">
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
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Next Available</h4>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
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
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Available
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Session Types */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Session Types</h4>
              <div className="space-y-2">
                {sessionTypes.includes('online') && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Video Call</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      €{pricing?.online?.min || 80}-{pricing?.online?.max || 120}
                    </span>
                  </div>
                )}
                {sessionTypes.includes('office') && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Office Visit</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      €{pricing?.office?.min || 100}-{pricing?.office?.max || 150}
                    </span>
                  </div>
                )}
                {sessionTypes.includes('home') && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Home Visit</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      €{pricing?.home?.min || 120}-{pricing?.home?.max || 180}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowProfileDialog(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
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

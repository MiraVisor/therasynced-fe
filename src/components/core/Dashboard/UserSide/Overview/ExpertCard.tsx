import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [, setShowMenu] = useState(false);

  // Mock data for demo purposes
  const location = 'Los Angeles, CA';
  const education = ['Doctor of Physical Therapy', 'University of California'];
  const services = [
    'Sports Injury Rehabilitation',
    'Massage Therapy',
    'Posture Correction',
    'Pain Management',
  ];

  const handleBookNow = () => {
    router.push(`/dashboard/doctors/${id}`);
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

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  // CTA handlers
  const handleReport = () => {
    setShowMenu(false);
    toast.info('Report submitted (mock)');
  };
  const handleSendMessage = () => {
    setShowMenu(false);
    toast.info('Message dialog (mock)');
  };

  return (
    <>
      <div
        className="relative flex flex-col justify-between  border hover:border-transparent rounded-2xl p-5 w-full h-full shadow-sm hover:shadow-lg transition-all duration-200 "
        tabIndex={0}
      >
        {/* Favorite Icon */}
        <Button
          variant={'ghost'}
          onClick={handleFavorite}
          className={`absolute top-4 right-4 z-10 rounded-full p-1.5 transition-colors ${isFavorite ? 'bg-pink-50 text-pink-500' : 'bg-gray-100 text-gray-400 hover:text-pink-500 hover:bg-pink-50'}`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          tabIndex={0}
        >
          {isFavorite ? '♥' : '♡'}
        </Button>
        {/* Main Info Row */}
        <div className="flex items-center gap-4 mb-2">
          <div className="relative flex-shrink-0">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg font-bold">
                {name && typeof name === 'string' ? name.charAt(0).toUpperCase() : ''}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{specialty}</p>
            <span className="flex items-center text-xs">{yearsOfExperience} years</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-xs text-gray-500 ml-1">({rating})</span>
            </div>
          </div>
        </div>
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3 mt-2">
          {description}
        </p>
        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button variant="outline" className="flex-1 " onClick={handleOpenProfile}>
            View Profile
          </Button>
          <Button className="flex-1 " onClick={handleBookNow}>
            Book Now
          </Button>
        </div>
      </div>
      {/* Profile Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl w-full p-0 overflow-visible sm:max-w-xl sm:p-0">
          <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto w-full">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4 w-full">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-2xl font-bold">
                  {name && typeof name === 'string' ? name.charAt(0).toUpperCase() : ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 mb-1 w-full">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {name}
                  </span>
                  {/* Verified badge (optional) */}
                  {/* <span className="ml-1 text-blue-500" title="Verified">✔️</span> */}
                </div>
                <div className="text-sm sm:text-md text-gray-500 dark:text-gray-300 mb-1">
                  {specialty}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({rating})</span>
                </div>
              </div>
            </div>
            {/* Location */}
            <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 mb-2 w-full">
              <span className="font-semibold">Location</span>
              <span className="text-gray-600 dark:text-gray-300">{location}</span>
            </div>
            {/* Education */}
            <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 mt-2 mb-1 w-full">
              <span className="font-semibold">Education</span>
            </div>
            <ul className="mb-2 text-gray-700 dark:text-gray-300 text-sm  w-full">
              {education.map((ed, idx) => (
                <li key={idx}>{ed}</li>
              ))}
            </ul>
            {/* Services */}
            <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 mt-2 mb-1 w-full">
              <span className="font-semibold">Services</span>
            </div>
            <ul className="mb-2 text-gray-700 dark:text-gray-300 text-sm w-full">
              {services.map((service, idx) => (
                <li key={idx}>{service}</li>
              ))}
            </ul>
            {/* About */}
            <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 mt-2 mb-1 w-full">
              <span className="font-semibold">About</span>
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mb-4 w-full">
              {description}
            </div>
            {/* CTAs */}
            <div className="grid grid-rows-2 gap-2 mt-6 w-full">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto flex-1"
                  onClick={handleReport}
                >
                  Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex-1"
                  onClick={handleSendMessage}
                >
                  Send Message
                </Button>
              </div>
              <Button className="w-full sm:w-auto flex-1" onClick={handleBookNow}>
                Book Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpertCard;

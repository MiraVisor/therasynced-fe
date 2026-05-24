'use client';

import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerificationBadge } from '@/components/ui/verification-badge';
import type { Expert, Slot } from '@/types/types';

interface InlineBookingModalProps {
  freelancer: Expert | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (freelancer: Expert, slot: Slot) => void;
}

const InlineBookingModal: React.FC<InlineBookingModalProps> = ({
  freelancer,
  isOpen,
  onClose,
  onBook,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  if (!freelancer) return null;

  // No slots available - redirect to booking page
  const availableSlots: Slot[] = [];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLocationIcon = (locationType: string) => {
    return locationType === 'VIRTUAL' ? MapPin : MapPin;
  };

  const getLocationText = (locationType: string) => {
    switch (locationType) {
      case 'OFFICE':
        return 'Office';
      case 'VIRTUAL':
        return 'Online';
      case 'HOME':
        return 'Home Visit';
      default:
        return 'Virtual';
    }
  };

  const handleBook = () => {
    if (selectedSlot) {
      onBook(freelancer, selectedSlot);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-poppins font-semibold text-sm flex-shrink-0">
              {freelancer.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-poppins font-semibold">{freelancer.name}</h2>
                <VerificationBadge
                  status={freelancer.verificationStatus || 'unverified'}
                  size="sm"
                />
              </div>
              {freelancer.specialty && (
                <p className="text-sm font-inter text-gray-600">{freelancer.specialty}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Therapist Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{freelancer.rating}</span>
                  <span className="text-sm text-gray-500">({freelancer.reviews || 0} reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Slots */}
          <div>
            <h3 className="text-lg font-poppins font-semibold mb-4">Available Times</h3>
            {availableSlots.length > 0 ? (
              <div className="grid gap-3">
                {availableSlots.map((slot) => {
                  const LocationIcon = getLocationIcon(slot.locationType);
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200  hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{formatDate(slot.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{formatTime(slot.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <LocationIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {getLocationText(slot.locationType)}
                              </span>
                            </div>
                          </div>
                          <div className="text-lg font-poppins font-semibold text-primary">
                            EUR {slot.basePrice}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No available slots at this time.</p>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            )}
          </div>

          {/* Book Button */}
          {availableSlots.length > 0 && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleBook}
                disabled={!selectedSlot}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                Book Session - €{selectedSlot?.basePrice || 0}
              </Button>
              <Button onClick={onClose} variant="outline" className="px-6">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InlineBookingModal;

'use client';

import { Home, MapPin } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBookingStore } from '@/stores/bookingStore';
import { LocationType } from '@/types/enums';
import { Slot } from '@/types/types';

interface LocationSelectionStepProps {
  slot: Slot;
}

export const LocationSelectionStep: React.FC<LocationSelectionStepProps> = ({ slot }) => {
  const { selectedLocationType, clientAddress, setSelectedLocationType, setClientAddress } =
    useBookingStore();

  // Determine available location types from slot
  const availableLocationTypes: LocationType[] = [];
  if (slot.locationType === LocationType.HOME || slot.locationType === LocationType.CLINIC) {
    availableLocationTypes.push(slot.locationType);
  } else {
    // If slot supports both, show both options
    availableLocationTypes.push(LocationType.HOME, LocationType.CLINIC);
  }

  // If only one location type is available, auto-select it
  if (availableLocationTypes.length === 1 && !selectedLocationType) {
    setSelectedLocationType(availableLocationTypes[0] ?? null);
  }

  const handleLocationChange = (value: string) => {
    setSelectedLocationType(value as LocationType);
    if (value !== LocationType.HOME) {
      setClientAddress('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-poppins font-bold text-charcoal
          Choose Location
        </h2>
        <p className="text-gray-600 text-lg font-inter">
          Where would you like to have your appointment?
        </p>
      </div>

      {/* Location Options */}
      <RadioGroup
        value={selectedLocationType || undefined}
        onValueChange={handleLocationChange}
        className="space-y-4"
      >
        {availableLocationTypes.includes(LocationType.HOME) && (
          <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value={LocationType.HOME} id="home" className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor="home"
                className="font-medium text-gray-900 cursor-pointer flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                At Home
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                The freelancer will come to your location
              </p>
              {selectedLocationType === LocationType.HOME && (
                <div className="mt-4">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700
                  >
                    Your Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your full address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {availableLocationTypes.includes(LocationType.CLINIC) && (
          <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value={LocationType.CLINIC} id="clinic" className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor="clinic"
                className="font-medium text-gray-900 cursor-pointer flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                At Clinic
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Visit the freelancer's clinic location
              </p>
              {slot.location && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900
                    {slot.location.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {slot.location.address}
                  </p>
                  {slot.location.additionalFee > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Additional fee: €{slot.location.additionalFee}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </RadioGroup>

      {/* Validation Message */}
      {selectedLocationType === LocationType.HOME && !clientAddress.trim() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800
            Please provide your address for home visit appointments.
          </p>
        </div>
      )}
    </div>
  );
};

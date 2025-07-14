import React, { useEffect, useRef, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { CiLocationOn } from 'react-icons/ci';

interface SearchBarProps {
  placeholder?: string;
  location?: string;
  onSearch?: (value: string) => void;
  isLocationEnabled?: boolean;
  onLocationChange?: (location: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for Therapists',
  location = 'Dublin, Ireland',
  onSearch,
  isLocationEnabled = false,
  onLocationChange,
}) => {
  const [userLocation, setUserLocation] = useState(location);
  const fetchedLocation = useRef(false);

  useEffect(() => {
    // Only fetch location once per mount if enabled and not already fetched
    if (isLocationEnabled && !fetchedLocation.current) {
      fetchedLocation.current = true;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              );
              const data = await res.json();
              const city = data.address?.city || data.address?.town || data.address?.village || '';
              const country = data.address?.country || '';
              const loc = city && country ? `${city}, ${country}` : country || city || 'Unknown';
              setUserLocation(loc);
              onLocationChange?.(loc);
            } catch {
              setUserLocation('Location unavailable');
            }
          },
          () => setUserLocation('Location unavailable'),
        );
      } else {
        setUserLocation('Location unavailable');
      }
    }
  }, [isLocationEnabled, onLocationChange]);

  useEffect(() => {
    setUserLocation(location);
  }, [location]);

  return (
    <div className="flex items-center gap-4 w-full max-w-2xl">
      <div className="flex items-center bg-dashboard-search rounded-full px-4 py-2 flex-1 border border-border/30">
        <CiSearch className="text-xl text-primary mr-2" />
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent outline-none text-foreground flex-1 placeholder:text-gray-400"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      {isLocationEnabled && (
        <div className="flex items-center bg-dashboard-search rounded-full px-4 py-2 border border-border/30">
          <CiLocationOn className="text-xl text-primary mr-2" />
          <span className="text-foreground text-sm">{userLocation}</span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
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
          <span className="text-foreground text-sm">{location}</span>
        </div>
      )}
    </div>
  );
};

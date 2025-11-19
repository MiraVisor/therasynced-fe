'use client';

import { Loader2, Search, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { TierBadge } from '@/components/ui/tier-badge';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { freelancerService } from '@/services/freelancerService';
import { Expert } from '@/types/types';

interface SearchWithDropdownProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export const SearchWithDropdown: React.FC<SearchWithDropdownProps> = ({
  onSearch,
  isSearching = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Expert[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [highlightedFreelancer, setHighlightedFreelancer] = useState<string | null>(null);
  const router = useRouter();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Map freelancer data to Expert format (simplified version)
  const mapFreelancerToExpert = (freelancer: any): Expert => {
    const cardInfo = freelancer.cardInfo || {};
    return {
      id: freelancer.id,
      name: freelancer.name || cardInfo.name,
      specialty: cardInfo.mainService || freelancer.services?.[0]?.name || '',
      rating: cardInfo.averageRating || freelancer.averageRating,
      reviews: cardInfo.patientStories || 0,
      description: freelancer.description || cardInfo.title || '',
      isFavorite: freelancer.isFavorite ?? false,
      profilePicture: freelancer.profilePicture,
      cardInfo: cardInfo,
      planFeatures: freelancer.planFeatures || null,
      tier: freelancer.planFeatures?.planType || null,
      verificationStatus: freelancer.verificationStatus || 'unverified',
    };
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await freelancerService.searchFreelancersAutocomplete(query, 8);
      if (response.success && Array.isArray(response.data)) {
        const mapped = response.data.map(mapFreelancerToExpert);
        setSuggestions(mapped);
        setShowDropdown(mapped.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchSuggestions]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
    if (!value.trim()) {
      setShowDropdown(false);
      onSearch('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (freelancer: Expert) => {
    setSearchQuery(freelancer.name || '');
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSearch(freelancer.name || '');
    // Optionally navigate to freelancer profile
    // router.push(`/dashboard/freelancer/${freelancer.id}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        onSearch(searchQuery);
        setShowDropdown(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (searchQuery.trim()) {
          onSearch(searchQuery);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search freelancers by name, specialty, or keywords..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          className="pl-10 pr-4 py-3 text-base border-gray-200 focus:border-primary focus:ring-primary"
        />
        {(isSearching || loadingSuggestions) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-[400px] overflow-y-auto"
        >
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p>No freelancers found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <ul className="py-2" role="listbox">
              {suggestions.map((freelancer, index) => (
                <li
                  key={freelancer.id}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors
                    ${
                      selectedIndex === index || highlightedFreelancer === freelancer.id
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                  onClick={() => handleSuggestionClick(freelancer)}
                  onMouseEnter={() => setHighlightedFreelancer(freelancer.id)}
                  onMouseLeave={() => setHighlightedFreelancer(null)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0 border-2 border-primary/20">
                      {freelancer.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {freelancer.name}
                        </span>
                        <VerificationBadge
                          status={freelancer.verificationStatus || 'unverified'}
                          size="sm"
                        />
                        {freelancer.tier && (
                          <TierBadge tier={freelancer.tier} size="sm" showIcon={false} />
                        )}
                      </div>
                      {freelancer.specialty && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                          {freelancer.specialty}
                        </p>
                      )}
                      {freelancer.rating && freelancer.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {freelancer.rating.toFixed(1)}
                            {freelancer.reviews > 0 && ` (${freelancer.reviews} reviews)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithDropdown;

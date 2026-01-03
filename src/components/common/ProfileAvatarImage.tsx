'use client';

import React, { useCallback, useEffect, useState } from 'react';

import * as profileApi from '@/services/profileService';
import { AvatarImage } from '@/components/ui/avatar';

interface ProfileAvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarImage> {
  /**
   * Whether this is the current user's profile picture (enables auto-refresh on error)
   * @default false
   */
  isCurrentUser?: boolean;
  /**
   * Callback when URL refresh fails
   */
  onRefreshError?: (error: Error) => void;
}

/**
 * Enhanced AvatarImage component that handles expired pre-signed URLs
 *
 * Profile picture URLs are pre-signed and expire after 1 hour. This component:
 * - For current user (isCurrentUser=true): Automatically refreshes expired URLs using /profile/picture/signed-url
 * - For other users: Falls back to AvatarFallback when URL expires (graceful degradation)
 *
 * Usage:
 * - Current user: <ProfileAvatarImage src={url} isCurrentUser={true} />
 * - Other users: <ProfileAvatarImage src={url} /> (fallback will show on expiry)
 *
 * Note: For other users' profile pictures, expired URLs will show the AvatarFallback.
 * To refresh, refetch the data from the original endpoint (e.g., /freelancer/details/:id).
 */
export const ProfileAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarImage>,
  ProfileAvatarImageProps
>(({ isCurrentUser = false, onRefreshError, src, onError, ...props }, ref) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleError = useCallback(
    async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // For other users, just call original onError handler (AvatarFallback will show)
      // We can't refresh their URLs without refetching from the original endpoint
      if (!isCurrentUser) {
        onError?.(e);
        return;
      }

      // If already refreshing, don't retry
      if (isRefreshing) {
        onError?.(e);
        return;
      }

      try {
        setIsRefreshing(true);
        // URL expired, get a new signed URL for current user
        const response = await profileApi.getProfilePictureSignedUrl();
        const newUrl = response.data.signedUrl;
        setImageSrc(newUrl);
        // Update the image source
        if (e.currentTarget) {
          e.currentTarget.src = newUrl;
        }
      } catch (error) {
        console.error('Failed to refresh profile picture URL:', error);
        onRefreshError?.(error as Error);
        onError?.(e);
      } finally {
        setIsRefreshing(false);
      }
    },
    [isCurrentUser, isRefreshing, onError, onRefreshError],
  );

  // Update imageSrc when src prop changes
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return <AvatarImage ref={ref} src={imageSrc} onError={handleError} {...props} />;
});

ProfileAvatarImage.displayName = 'ProfileAvatarImage';

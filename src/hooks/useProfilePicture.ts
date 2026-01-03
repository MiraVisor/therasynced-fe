import { useCallback, useEffect, useState } from 'react';

import * as profileApi from '@/services/profileService';

/**
 * Hook to manage profile picture URL with auto-refresh
 * Profile picture URLs are pre-signed and expire after 1 hour
 * This hook automatically refreshes the URL every 50 minutes
 */
export function useProfilePicture(initialUrl?: string | null) {
  const [url, setUrl] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshUrl = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileApi.getProfilePictureSignedUrl();
      setUrl(response.data.signedUrl);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to refresh profile picture URL:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set initial URL if provided
    if (initialUrl) {
      setUrl(initialUrl);
    }

    // Refresh URL every 50 minutes (before 1 hour expiry)
    const interval = setInterval(
      () => {
        refreshUrl();
      },
      50 * 60 * 1000,
    ); // 50 minutes

    return () => {
      clearInterval(interval);
    };
  }, [initialUrl, refreshUrl]);

  return {
    url,
    loading,
    error,
    refreshUrl,
  };
}

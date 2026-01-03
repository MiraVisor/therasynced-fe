/**
 * Utility functions for handling profile picture signed URLs
 *
 * Profile picture URLs are pre-signed and expire after 1 hour.
 * These utilities help manage expired URLs gracefully.
 */

/**
 * Check if a URL is likely expired (basic check - not 100% accurate)
 * This is a heuristic check - actual expiry is handled by the browser when loading the image
 */
export function isUrlLikelyExpired(url: string | null | undefined): boolean {
  if (!url) return true;

  // Signed URLs typically contain query parameters with expiration info
  // This is a basic check - actual validation happens when the image loads
  return false; // We can't reliably check expiry without parsing the URL
}

/**
 * Handle expired profile picture URL error
 * Logs the error and provides guidance for developers
 */
export function handleExpiredProfilePictureUrl(
  error: Error,
  context: 'current-user' | 'other-user',
): void {
  if (context === 'current-user') {
    console.warn('Profile picture URL expired for current user. Attempting to refresh...', error);
  } else {
    console.warn(
      'Profile picture URL expired for another user. AvatarFallback will be shown. ' +
        'To refresh, refetch the data from the original endpoint.',
      error,
    );
  }
}

/**
 * Get profile picture URL with fallback
 * Returns the URL if valid, otherwise returns undefined (for AvatarFallback)
 */
export function getProfilePictureUrl(url: string | null | undefined): string | undefined {
  return url && url.trim() !== '' ? url : undefined;
}

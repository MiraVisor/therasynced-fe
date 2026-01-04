# Profile Picture Signed URLs Implementation

## Overview

All profile picture URLs are now **pre-signed URLs** that expire after **1 hour**. This provides better security and GDPR compliance by keeping Supabase buckets private.

## Key Changes

- ✅ All profile picture URLs expire after 1 hour
- ✅ Works with private Supabase buckets (no need to make bucket public)
- ✅ More secure and GDPR compliant
- ✅ No breaking changes to API endpoints or response structure

## Affected Endpoints

### Profile Endpoints

- `GET /profile` - Returns signed URL in `data.user.profilePicture`
- `POST /profile/picture` - Returns signed URL in `data.data.profilePicture`
- `GET /profile/picture/signed-url` (NEW) - Refresh expired URL

### Freelancer Endpoints

- `GET /freelancer/details/:id` - Returns signed URL in `data.data.profile.profilePicture`

### Slot Endpoints

- `GET /slot/available/:freelancerId` - Each slot has `profilePicture` (signed URL)
- `GET /slot/available-by-date` - Each slot has `profilePicture` (signed URL)
- `GET /slot/list` - Each slot has `profilePicture` (signed URL)

### Booking Endpoints

- `GET /booking/freelancer/appointments-by-date` - Client & freelancer `profilePicture` (signed URLs)
- `GET /booking/freelancer/all` - Client & freelancer `profilePicture` (signed URLs)
- `GET /booking/freelancer/today` - Client & freelancer `profilePicture` (signed URLs)
- `GET /booking/freelancer/future` - Client & freelancer `profilePicture` (signed URLs)
- `GET /booking/patient/all` - Freelancer `profilePicture` (signed URL)
- `GET /booking/patient/history` - Freelancer `profilePicture` (signed URL)

## TypeScript Type

```typescript
profilePicture: string | null; // Signed URL (expires in 1 hour) or null
```

## Implementation

### 1. ProfileAvatarImage Component

Enhanced AvatarImage component that handles expired URLs:

```tsx
import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';

// For current user (auto-refreshes expired URLs)
<Avatar>
  <ProfileAvatarImage
    src={profilePicture}
    isCurrentUser={true}
  />
  <AvatarFallback>...</AvatarFallback>
</Avatar>

// For other users (falls back gracefully)
<Avatar>
  <ProfileAvatarImage src={freelancer.profilePicture} />
  <AvatarFallback>...</AvatarFallback>
</Avatar>
```

**Behavior:**

- **Current user** (`isCurrentUser={true}`): Automatically refreshes expired URLs using `/profile/picture/signed-url`
- **Other users**: Falls back to `AvatarFallback` when URL expires (graceful degradation)

### 2. useProfilePicture Hook

Hook for proactive URL refresh (optional, for long-lived components):

```tsx
import { useProfilePicture } from '@/hooks/useProfilePicture';

function MyComponent() {
  const { url, loading, error, refreshUrl } = useProfilePicture(initialUrl);

  // URL auto-refreshes every 50 minutes
  // Use url in your component
}
```

### 3. Profile Service Functions

```typescript
import * as profileApi from '@/services/profileService';

// Get fresh signed URL for current user
const response = await profileApi.getProfilePictureSignedUrl();
const newUrl = response.data.signedUrl;

// Upload profile picture (returns signed URL)
const response = await profileApi.uploadProfilePicture(file);
const signedUrl = response.data.data.profilePicture;
```

## Error Handling

### Current User Profile Pictures

The `ProfileAvatarImage` component automatically handles expired URLs:

1. Detects image load error
2. Calls `/profile/picture/signed-url` to get fresh URL
3. Updates image source automatically
4. Falls back to `AvatarFallback` if refresh fails

### Other Users' Profile Pictures

For other users' profile pictures:

1. `AvatarImage` fails to load expired URL
2. Automatically shows `AvatarFallback` (Radix UI behavior)
3. To refresh: Refetch data from original endpoint (e.g., `/freelancer/details/:id`)

## Best Practices

1. **Always include AvatarFallback** - Required for graceful degradation
2. **Use ProfileAvatarImage for current user** - Enables auto-refresh
3. **Regular AvatarImage is fine for others** - Fallback handles expiry
4. **Refetch data periodically** - For long-lived components showing other users' pictures

## Example: Complete Avatar Implementation

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileAvatarImage } from '@/components/common/ProfileAvatarImage';

// Current user
<Avatar>
  <ProfileAvatarImage
    src={user.profilePicture}
    isCurrentUser={true}
    alt={user.name}
  />
  <AvatarFallback>
    {user.name.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>

// Other user (freelancer/client)
<Avatar>
  <ProfileAvatarImage
    src={freelancer.profilePicture}
    alt={freelancer.name}
  />
  <AvatarFallback>
    {freelancer.name.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>
```

## Testing Checklist

- [ ] Current user profile picture displays correctly
- [ ] Current user profile picture refreshes when expired
- [ ] Other users' profile pictures show fallback when expired
- [ ] Profile picture upload works and returns signed URL
- [ ] All Avatar components have AvatarFallback
- [ ] No broken images in production

## Troubleshooting

### Image not showing

- Check if URL is null/undefined
- Verify AvatarFallback is present
- Check browser console for errors

### URL expired immediately

- Verify backend is generating URLs correctly
- Check URL expiration time (should be 1 hour)

### Refresh not working

- Ensure `isCurrentUser={true}` is set for current user
- Check network tab for API calls
- Verify authentication token is valid

## Migration Notes

- ✅ No breaking changes - existing code continues to work
- ✅ AvatarFallback handles expired URLs gracefully
- ✅ ProfileAvatarImage provides enhanced handling for current user
- ✅ All existing Avatar components work as-is (with fallback)

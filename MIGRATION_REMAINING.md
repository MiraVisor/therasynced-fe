# Remaining Migration Tasks

## Files Still Using Redux (35 files)

### High Priority - Core Functionality

1. `src/components/core/authentication/MultiStepSignup.tsx` - Signup form
2. `src/components/core/authentication/ClientAuthPage.tsx` - Auth page wrapper
3. `src/app/auth/callback/page.tsx` - OAuth callback
4. `src/app/authentication/verify-email/page.tsx` - Email verification
5. `src/app/subscription/success/page.tsx` - Subscription success

### Booking Components

6. `src/app/dashboard/my-bookings/page.tsx`
7. `src/app/dashboard/my-bookings/[bookingId]/page.tsx`
8. `src/components/core/Dashboard/UserSide/MyBookings/ModernBookingFlow.tsx`
9. `src/components/core/Dashboard/UserSide/MyBookings/RescheduleBooking.tsx`
10. `src/components/core/Dashboard/UserSide/MyBookings/MyBookingHome.tsx`

### Freelancer/Explore Components

11. `src/components/core/Dashboard/UserSide/Explore/UserExploreMain.tsx`
12. `src/components/core/Dashboard/UserSide/Overview/ExpertCard.tsx`
13. `src/components/core/Dashboard/UserSide/Home/index.tsx`
14. `src/components/core/Dashboard/UserSide/Home/FavoriteTherapistCard.tsx`

### Slot Management

15. `src/app/dashboard/slots/page.tsx`
16. `src/app/dashboard/slots/[slotId]/page.tsx`
17. `src/components/core/Dashboard/FreelancerSide/SlotManagement/CreateSlotForm.tsx`

### Account & Profile

18. `src/app/dashboard/account/page.tsx`
19. `src/components/core/Dashboard/Account/DataRightsSection.tsx`
20. `src/components/core/Dashboard/Account/DataAccessLogsSection.tsx`

### Verification

21. `src/app/dashboard/verification/page.tsx`
22. `src/components/core/Dashboard/FreelancerSide/Verification/VerificationStatusWidget.tsx`

### Subscription

23. `src/components/core/Dashboard/FreelancerSide/Subscription/SubscriptionManagement.tsx`
24. `src/components/core/Dashboard/FreelancerSide/Subscription/SubscriptionBadge.tsx`
25. `src/components/core/Dashboard/FreelancerSide/Subscription/PaymentForm.tsx`

### Chat/Messages

26. `src/app/dashboard/messages/page.tsx`
27. `src/hooks/useChat.ts` - Needs full rewrite for Zustand + React Query

### Admin Components

28. `src/components/core/Dashboard/AdminSide/AdminHome.tsx`
29. `src/app/dashboard/admin/audit/page.tsx`
30. `src/app/dashboard/admin/exports/page.tsx`
31. `src/app/dashboard/admin/breaches/[id]/page.tsx`
32. `src/app/dashboard/admin/health-data-logs/page.tsx`

### Other Components

33. `src/components/core/Dashboard/FreelancerSide/Home/index.tsx`
34. `src/components/core/Dashboard/FreelancerSide/Appointment/index.tsx`
35. `src/components/core/Dashboard/FreelancerSide/Appointment/AppointmentDetails/ActionButtons.tsx`
36. `src/components/core/Dashboard/FreelancerSide/Appointment/AppointmentDetails/StatusUpdate.tsx`
37. `src/components/core/Dashboard/FreelancerSide/Appointment/InvoiceGenerationDialog.tsx`
38. `src/app/dashboard/analytics/page.tsx`
39. `src/app/dashboard/loyalty/page.tsx`
40. `src/app/dashboard/favorites/page.tsx`
41. `src/app/dashboard/my-complaints/page.tsx`
42. `src/app/unauthorized.tsx`
43. `src/components/common/main-layout.tsx`

## Migration Pattern for Each File

### Step 1: Update Imports

```typescript
// OLD
import { useAuth } from '@/redux/hooks/useAppHooks';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from '@/redux/slices/dataSlice';

// NEW
import { useAuth } from '@/hooks/useAuthZustand';
import { useData } from '@/hooks/queries/useData';
import { useCreateData } from '@/hooks/queries/useData';
```

### Step 2: Replace Redux Selectors

```typescript
// OLD
const { data, loading, error } = useSelector((state) => state.data);

// NEW
const { data, isLoading: loading, error } = useData();
```

### Step 3: Replace Redux Dispatches

```typescript
// OLD
const dispatch = useDispatch();
dispatch(fetchData());
dispatch(createData(payload));

// NEW
const { data } = useData(); // Auto-fetches
const { mutate: createData } = useCreateData();
createData(payload);
```

### Step 4: Update Loading/Error States

```typescript
// OLD
if (loading) return <Loading />;
if (error) return <Error />;

// NEW
if (isLoading) return <Loading />;
if (isError) return <Error />;
```

## Next Steps

1. **Batch 1**: Migrate authentication components (5 files)
2. **Batch 2**: Migrate booking components (5 files)
3. **Batch 3**: Migrate freelancer/explore components (4 files)
4. **Batch 4**: Migrate slot management (3 files)
5. **Batch 5**: Migrate account/profile (3 files)
6. **Batch 6**: Migrate chat/messages (2 files)
7. **Batch 7**: Migrate remaining components (13 files)
8. **Final**: Remove Redux code and update StoreProvider

# Using Mock Data for Testing

## Quick Test Setup

To test the search functionality with mock data, temporarily modify `freelancerService.ts`:

### Option 1: Mock in Service (Recommended for Testing)

```typescript
// In src/services/freelancerService.ts
import { mockSearchResponse } from '@/components/core/Dashboard/UserSide/Overview/mockSearchData';

export const freelancerService = {
  // ... other methods

  searchFreelancers: async (params?: any): Promise<TierFreelancerResponse> => {
    // TEMPORARY: Uncomment to use mock data
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(mockSearchResponse as TierFreelancerResponse);
    //   }, 500); // Simulate network delay
    // });

    // REAL API CALL (keep this for production)
    const response = await api.get(ENDPOINTS.freelancer.search, { params });
    return response.data;
  },
};
```

### Option 2: Mock in Component (For Component Testing)

```typescript
// In UserOverviewMain.tsx, temporarily replace the fetchFreelancers function:

const fetchFreelancers = useCallback(async (page: number = 1, append: boolean = false) => {
  // TEMPORARY MOCK DATA
  import { mockSearchResponse } from './mockSearchData';

  setLoading(true);
  setTimeout(() => {
    const response = mockSearchResponse;
    if (response.success && Array.isArray(response.data)) {
      const mapped = response.data.map(mapFreelancerToExpert);
      setFreelancers(mapped);
      setPagination(response.pagination);
    }
    setLoading(false);
  }, 500);
}, [filters, sortBy, sortOrder]);
```

## Test Scenarios

### 1. Test with 12 Results (Page 1)

- Use `mockSearchResponse`
- Should show 12 freelancer cards
- Should display "Showing 12 of 47 therapists"
- Should show "Load More" button

### 2. Test Empty Results

- Use `mockEmptySearchResponse`
- Should show empty state message
- Should show "Clear All Filters" button

### 3. Test Last Page

- Use `mockSearchResponsePage4`
- Should show remaining 11 freelancers
- Should NOT show "Load More" button
- `hasNext` should be `false`

## Mock Data Structure

The mock data includes:

- ✅ 12 complete freelancer objects
- ✅ Different tiers (GOLD, SILVER, BRONZE)
- ✅ Various verification statuses
- ✅ Different cities and locations
- ✅ Various ratings and review counts
- ✅ Different pricing ranges
- ✅ Different availability (slots)
- ✅ Pagination metadata

## Testing Filters

You can test filters by modifying the mock data:

- Filter by specialty: Only include freelancers with specific `mainJobTitle.id`
- Filter by location: Only include freelancers with specific `city`
- Filter by price: Only include freelancers within price range
- Filter by verification: Only include freelancers with specific `verificationStatus`

## Example: Testing Specialty Filter

```typescript
// Filter to show only Psychologists
const filteredMock = {
  ...mockSearchResponse,
  data: mockSearchResponse.data.filter(
    (f) => f.mainJobTitle.id === 'jt-1', // Psychologist
  ),
  pagination: {
    ...mockSearchResponse.pagination,
    total: 6, // Update total count
    totalPages: 1,
  },
};
```

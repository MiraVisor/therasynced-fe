# Enhanced Booking Search - Proof of Concept

## Overview

This document describes the enhanced booking search functionality that allows users to search for freelancers by name, location (city), and browse by date. The implementation provides a flexible, user-friendly search experience with multiple search modes and filter combinations.

## Features

### 1. **Multiple Search Modes**

- **Combined Mode**: Search by both name and location simultaneously
- **Name Only Mode**: Search exclusively by freelancer name
- **Location Only Mode**: Search exclusively by city/location

### 2. **Search by Name**

- Real-time autocomplete suggestions
- Debounced search (300ms delay) for optimal performance
- Minimum 2 characters required to trigger search
- Displays freelancer profile information in results

### 3. **Search by Location**

- Search by city or location name
- Integrated with backend `location` parameter
- Shows location information in search results
- Can be combined with name search for precise filtering

### 4. **Browse by Date**

- Calendar picker for date selection
- Shows all freelancers available on selected date
- Can be combined with name/location search
- Automatically filters results when date is selected

### 5. **Active Filters Display**

- Visual indicators for active filters
- Quick removal of individual filters
- "Clear All" button to reset all filters
- Shows selected date in filter badges

### 6. **Smart Results Display**

- Shows search results when name/location queries are active
- Shows date-filtered results when only date is selected
- Combines filters intelligently
- Displays result count

## Component Structure

### Main Component: `EnhancedBookingSearch`

**Location**: `src/components/core/Dashboard/UserSide/Booking/EnhancedBookingSearch.tsx`

**Props**:

```typescript
interface EnhancedBookingSearchProps {
  onFreelancerSelect: (freelancer: Expert) => void;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  selectedFreelancer?: string | null;
}
```

**Key Features**:

- Manages search state (name, location, date)
- Handles debounced search requests
- Integrates with `searchFreelancers` API
- Uses `useFreelancersByDate` hook for date-based filtering
- Provides clean UI with filter management

## API Integration

### Search API

The component uses the existing `searchFreelancers` function from `freelancerService.ts`:

```typescript
searchFreelancers({
  query: nameQuery, // Name search
  location: locationQuery, // Location search
  date: format(date, 'yyyy-MM-dd'), // Date filter
  limit: 20,
  sortBy: 'relevance',
  sortOrder: 'desc',
});
```

### Date Filtering API

Uses `useFreelancersByDate` hook which calls:

- Endpoint: `/slot/freelancers-by-date`
- Returns freelancers with available slots on the specified date

## Usage Example

### Basic Integration

```tsx
import { EnhancedBookingSearch } from '@/components/core/Dashboard/UserSide/Booking/EnhancedBookingSearch';

function BookingPage() {
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleFreelancerSelect = (freelancer: Expert) => {
    setSelectedFreelancer(freelancer.id);
    // Navigate to booking flow or show booking details
  };

  return (
    <EnhancedBookingSearch
      onFreelancerSelect={handleFreelancerSelect}
      onDateSelect={setSelectedDate}
      selectedDate={selectedDate}
      selectedFreelancer={selectedFreelancer}
    />
  );
}
```

### Demo Page

A complete demo page is available at:

- **Route**: `/dashboard/book-enhanced`
- **File**: `src/app/dashboard/book-enhanced/page.tsx`

This page demonstrates all features and can be used as a reference for integration.

## User Flow

1. **Initial State**: User sees search inputs and date picker
2. **Search by Name**: User types name → sees autocomplete results
3. **Search by Location**: User types location → sees filtered results
4. **Browse by Date**: User selects date → sees available freelancers
5. **Combined Search**: User can combine all three filters
6. **Select Freelancer**: User clicks on a result → triggers `onFreelancerSelect`
7. **Clear Filters**: User can clear individual or all filters

## Design Considerations

### Performance

- Debounced search (300ms) reduces API calls
- Results are memoized to prevent unnecessary re-renders
- Loading states provide user feedback

### User Experience

- Clear visual feedback for active filters
- Easy filter removal
- Responsive design for mobile and desktop
- Accessible keyboard navigation

### Integration

- Can be integrated into existing booking flow
- Maintains compatibility with current booking page structure
- Uses existing UI components and styling

## Future Enhancements

Potential improvements for production:

1. **Location Autocomplete**: Add location suggestions/autocomplete
2. **Advanced Filters**: Add filters for rating, price range, services
3. **Saved Searches**: Allow users to save favorite search combinations
4. **Recent Searches**: Show recently searched terms
5. **Map View**: Show freelancers on a map when location is searched
6. **Sort Options**: Add sorting by rating, price, distance
7. **Pagination**: Handle large result sets with pagination

## Testing

To test the enhanced search:

1. Navigate to `/dashboard/book-enhanced`
2. Try different search modes:
   - Type a name in the name field
   - Type a location in the location field
   - Select a date from the calendar
   - Combine all three filters
3. Test filter removal:
   - Click X on individual filters
   - Click "Clear All" button
4. Select a freelancer to see the selection callback

## Integration with Existing Booking Page

To integrate this into the main booking page (`/dashboard/book`):

1. Replace or enhance the existing search section
2. Keep the existing booking flow after freelancer selection
3. Maintain compatibility with favorites functionality
4. Ensure date selection integrates with the calendar component

## Notes

- The component uses the existing color scheme and typography
- Follows the same design patterns as the current booking page
- Maintains accessibility standards
- Responsive design for all screen sizes

# API Documentation for Booking Flow Enhancements

## Overview

This document describes the API endpoints and integration requirements for the new booking flow at `/dashboard/book`. All endpoints use REST (no WebSocket implementation).

---

## 1. Enhanced Freelancer Search

**Endpoint:** `GET /api/v1/freelancer/search`

**New Query Parameter:**

- `date` (optional, string): ISO date format `YYYY-MM-DD` (e.g., `2024-01-15`)

**Example Request:**

```
GET /api/v1/freelancer/search?date=2024-01-15&query=sarah&page=1&limit=12
```

**Response Format:**

```typescript
{
  data: Freelancer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Notes:**

- When `date` is provided, only freelancers with at least one available slot on that date are returned
- All other existing query parameters work the same way
- Date format must be `YYYY-MM-DD` (e.g., `2024-01-15`)

---

## 2. Get Available Slots by Freelancer (Enhanced)

**Endpoint:** `GET /api/v1/slot/available/:freelancerId`

**New Query Parameter:**

- `date` (optional, string): ISO date format `YYYY-MM-DD` (e.g., `2024-01-15`)

**Example Request:**

```
GET /api/v1/slot/available/freelancer-uuid?date=2024-01-15&page=1&limit=10
```

**Response Format:**

```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    freelancerId: string;
    freelancerName: string;
    profilePicture: string | null;
    locationType: 'HOME' | 'CLINIC';
    startTime: string; // ISO 8601 datetime
    endTime: string; // ISO 8601 datetime
    duration: number; // minutes
    basePrice: number;
    status: 'AVAILABLE';
    location: {
      id: string;
      name: string;
      address: string;
      type: 'OFFICE' | 'CLINIC';
      additionalFee: number;
    } | null;
    availableServiceCategories: Array<{
      id: string;
      name: string;
      description: string | null;
      jobTitle: {
        id: string;
        name: string;
      };
      locationTypes: ('HOME' | 'CLINIC')[]; // NEW: Array of location types
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    code: number;
    status: string;
    timestamp: string;
    path: string;
  }
}
```

**Important Changes:**

- `availableServiceCategories` now includes `locationTypes` array
- Each service category shows which location types (HOME/CLINIC) are available
- `freelancerName` and `profilePicture` are now included in the response

---

## 3. Get Available Slots by Date (NEW Endpoint)

**Endpoint:** `GET /api/v1/slot/available-by-date`

**Query Parameters:**

- `date` (required, string): ISO date format `YYYY-MM-DD` (e.g., `2024-01-15`)
- `freelancerId` (optional, string): Filter by specific freelancer
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)

**Example Request:**

```
GET /api/v1/slot/available-by-date?date=2024-01-15&page=1&limit=10
```

**Response Format:**

```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    freelancerId: string;
    freelancerName: string;
    profilePicture: string | null;
    averageRating: number; // 0 if no ratings
    numberOfRatings: number;
    locationType: 'HOME' | 'CLINIC';
    startTime: string; // ISO 8601 datetime
    endTime: string; // ISO 8601 datetime
    duration: number; // minutes
    basePrice: number;
    status: 'AVAILABLE';
    availableServiceCategories: Array<{
      id: string;
      name: string;
      description: string | null;
      jobTitle: {
        id: string;
        name: string;
      };
      locationTypes: ('HOME' | 'CLINIC')[]; // Array of location types
    }>;
    location: {
      id: string;
      name: string;
      address: string;
      type: 'OFFICE' | 'CLINIC';
      additionalFee: number;
    } | null;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  meta: {
    code: number;
    status: string;
    timestamp: string;
    path: string;
  }
}
```

**Notes:**

- Returns slots across all freelancers (or filtered by `freelancerId` if provided)
- Includes `averageRating` and `numberOfRatings` for each freelancer
- Automatically excludes blocked dates
- Includes `locationTypes` in `availableServiceCategories`

---

## 4. Get Service Categories (Enhanced)

**Endpoint:** `GET /api/v1/service/categories/all`

**New Query Parameters:**

- `slotId` (optional, string): Get services available for specific slot
- `freelancerId` (optional, string): Get services for specific freelancer (filters by job title and includes locationTypes)

**Example Requests:**

```
GET /api/v1/service/categories/all?slotId=slot-uuid
GET /api/v1/service/categories/all?freelancerId=freelancer-uuid
GET /api/v1/service/categories/all
```

**Response Format:**

```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    jobTitle: {
      id: string;
      name: string;
    };
    locationTypes?: ('HOME' | 'CLINIC')[]; // NEW: Only included when freelancerId provided
  }>;
  meta: {
    code: number;
    status: string;
    timestamp: string;
    path: string;
    count: number;
  }
}
```

**Important Notes:**

- `locationTypes` is only included when `freelancerId` is provided
- If `slotId` is provided, returns only categories available for that slot
- If `freelancerId` is provided, filters by freelancer's job title and includes `locationTypes`
- If neither is provided, returns all active service categories (without `locationTypes`)

---

## Frontend Integration Guide

### Date Format

Always use ISO date format: `YYYY-MM-DD`

- ✅ Correct: `"2024-01-15"`
- ❌ Wrong: `"01/15/2024"`, `"2024-1-15"`, `"15-01-2024"`

### Location Types Logic

When displaying service categories with `locationTypes`:

1. If all selected services support both HOME and CLINIC:
   - User can choose either location type

2. If all selected services support only HOME:
   - Auto-select HOME (or show only HOME option)

3. If all selected services support only CLINIC:
   - Auto-select CLINIC (or show only CLINIC option)

4. If services have mixed location types:
   - Show intersection (only location types supported by ALL selected services)

**Example:**

```typescript
// User selects: Service A (HOME, CLINIC) + Service B (CLINIC only)
// Result: Only CLINIC is available (intersection)

// User selects: Service A (HOME, CLINIC) + Service B (HOME, CLINIC)
// Result: Both HOME and CLINIC available
```

### Error Handling

**Date Validation Errors:**

- Status: `400 Bad Request`
- Message: `"Invalid date format. Use YYYY-MM-DD format"`

**Not Found Errors:**

- Status: `404 Not Found`
- Message: `"Slot with ID {slotId} not found"` or `"Freelancer with ID {freelancerId} not found"`

### Example Frontend Code

```typescript
// Search freelancers with date filter
const searchFreelancers = async (date?: string) => {
  const params = new URLSearchParams({
    page: '1',
    limit: '12',
    ...(date && { date }),
  });

  const response = await fetch(`/api/v1/freelancer/search?${params}`);
  return response.json();
};

// Get slots by date
const getSlotsByDate = async (date: string, freelancerId?: string) => {
  const params = new URLSearchParams({
    date,
    page: '1',
    limit: '10',
    ...(freelancerId && { freelancerId }),
  });

  const response = await fetch(`/api/v1/slot/available-by-date?${params}`);
  return response.json();
};

// Get service categories for a slot
const getServiceCategoriesForSlot = async (slotId: string) => {
  const response = await fetch(`/api/v1/service/categories/all?slotId=${slotId}`);
  return response.json();
};

// Get service categories for a freelancer (includes locationTypes)
const getServiceCategoriesForFreelancer = async (freelancerId: string) => {
  const response = await fetch(`/api/v1/service/categories/all?freelancerId=${freelancerId}`);
  return response.json();
};
```

### TypeScript Types

```typescript
type LocationType = 'HOME' | 'CLINIC';

interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  jobTitle: {
    id: string;
    name: string;
  };
  locationTypes?: LocationType[]; // Only present when freelancerId provided
}

interface Slot {
  id: string;
  freelancerId: string;
  freelancerName: string;
  profilePicture: string | null;
  locationType: LocationType;
  startTime: string;
  endTime: string;
  duration: number;
  basePrice: number;
  status: 'AVAILABLE';
  availableServiceCategories: Array<
    ServiceCategory & {
      locationTypes: LocationType[]; // Always present in slot responses
    }
  >;
  location: {
    id: string;
    name: string;
    address: string;
    type: 'OFFICE' | 'CLINIC';
    additionalFee: number;
  } | null;
}
```

---

## Summary

All endpoints maintain backward compatibility — existing code continues to work, and new parameters are optional.

**Key Points:**

- Use ISO date format (`YYYY-MM-DD`) for all date parameters
- `locationTypes` is included in slot responses and service category responses (when `freelancerId` is provided)
- New endpoint `/slot/available-by-date` for getting slots across all freelancers for a specific date
- Location selection logic is based on service categories, not slots

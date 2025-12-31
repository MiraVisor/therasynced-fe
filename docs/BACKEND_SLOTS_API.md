# Backend API Documentation: Slots Management

## Overview

This document outlines the backend API endpoints required for the slots management feature. The frontend expects these endpoints to be implemented or updated to match the specifications below.

---

## Base URL

All endpoints are prefixed with `/slot`

---

## Endpoints

### 1. Create Slots

**POST** `/slot/create`

Creates multiple slots for a freelancer based on day configurations.

**Request Body:**

```typescript
{
  duration: number;                    // Slot duration in minutes (required)
  slots: Array<{                       // Array of slots to create (required)
    startTime: string;                 // ISO 8601 datetime string (required)
    endTime: string;                   // ISO 8601 datetime string (required)
  }>;
  locationType?: LocationType;         // Optional: 'HOME' | 'CLINIC' | 'ONLINE'
  locationId?: string;                 // Optional: Location ID if using clinic
  serviceCategoryIds?: string[];       // Optional: Array of service category IDs
  notes?: string;                      // Optional: Additional notes
}
```

**Note:** Pricing is no longer set at slot level. Slots inherit pricing from the freelancer's account-level pricing settings:

- If `serviceCategoryIds` are provided, use service pricing for those categories
- Otherwise, use duration-based pricing for the specified `duration`
- Backend should calculate the price automatically based on these rules

**Response:**

```typescript
{
  success: boolean;
  data: Slot[];                        // Array of created slots
  message?: string;
}
```

**Slot Interface:**

```typescript
{
  id: string;
  freelancerId: string;
  startTime: string;                   // ISO 8601 datetime
  endTime: string;                     // ISO 8601 datetime
  duration: number;                     // minutes
  basePrice: number;                    // Calculated from account-level pricing (service or duration-based)
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'CANCELLED';
  locationType: LocationType;
  location?: {
    id: string;
    name: string;
    address: string;
    type: 'OFFICE' | 'CLINIC';
    additionalFee: number;
  } | null;
  createdAt: string;                    // ISO 8601 datetime
  updatedAt: string;                   // ISO 8601 datetime
}
```

**Notes:**

- The frontend generates slots from day configurations (Monday-Sunday) with start/end times
- **Slots are generated for a 3-month period** starting from the current week (Monday)
- All slots should be created atomically (all or nothing)
- Validate that the freelancer has not exceeded their subscription slot limit
- **Tier Restrictions**: Apply tier-based day restrictions at creation:
  - Bronze tier: Maximum 3 days (freelancer can choose any 3 days)
  - Silver tier: Maximum 5 days (freelancer can choose any 5 days)
  - Gold tier: All 7 days allowed
  - If slot creation request includes more days than tier allows, reject with error `TIER_DAY_LIMIT_EXCEEDED`
- **Pricing**: Slots automatically inherit pricing from freelancer's account settings:
  - If service categories are specified, calculate price from service pricing
  - Otherwise, use duration-based pricing for the slot duration
  - Backend must validate that pricing exists for the specified services/duration before creating slots

---

## Pricing Management Endpoints

### 9. Get Freelancer Pricing

**GET** `/freelancer/pricing`

Retrieves all pricing settings for the authenticated freelancer.

**Response:**

```typescript
{
  success: boolean;
  data: {
    servicePricing: Array<{
      serviceId: string;
      serviceName: string;
      price: number;
      currency?: string;                // Default: EUR
    }>;
    durationPricing: Array<{
      duration: number;                 // minutes (30, 60, 90, 120, etc.)
      price: number;
      currency?: string;                // Default: EUR
    }>;
  };
  message?: string;
}
```

**Notes:**

- Returns pricing for all services and durations configured by the freelancer
- If no pricing is set, return empty arrays
- Currency defaults to EUR if not specified

---

### 10. Update Service Pricing

**POST** `/freelancer/pricing/services`

Updates prices for one or more services.

**Request Body:**

```typescript
{
  pricing: Array<{
    serviceId: string; // Service ID (required)
    price: number; // Price in EUR (required, must be > 0)
  }>;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    servicePricing: Array<{
      serviceId: string;
      serviceName: string;
      price: number;
      currency?: string;
    }>;
  };
  message?: string;
}
```

**Notes:**

- Updates prices for specified services
- Validates that serviceId exists and belongs to the freelancer
- Validates that price is positive
- Returns updated service pricing array

---

### 11. Update Duration Pricing

**POST** `/freelancer/pricing/durations`

Updates prices for one or more slot durations.

**Request Body:**

```typescript
{
  pricing: Array<{
    duration: number; // Duration in minutes (required, must be > 0)
    price: number; // Price in EUR (required, must be > 0)
  }>;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    durationPricing: Array<{
      duration: number;
      price: number;
      currency?: string;
    }>;
  };
  message?: string;
}
```

**Notes:**

- Updates prices for specified durations
- Validates that duration is positive
- Validates that price is positive
- Common durations: 30, 45, 60, 90, 120 minutes
- Returns updated duration pricing array

---

### 2. Get My Slots (Freelancer)

**POST** `/slot/my-slots`

Retrieves all slots for the authenticated freelancer with optional filtering and pagination.

**Request Body:**

```typescript
{
  page?: number;                       // Default: 1
  limit?: number;                      // Default: 10, Max: 1000
  sortBy?: string;                     // Default: 'startTime'
  sortOrder?: 'asc' | 'desc';          // Default: 'asc'
  freelancerId?: string;               // Optional: Filter by freelancer ID
  weekStart?: string;                   // Optional: ISO date string for week start
  weekEnd?: string;                     // Optional: ISO date string for week end
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Slot[];                        // Array of slots
  message?: string;
}
```

**Notes:**

- Returns slots for the authenticated freelancer only
- Should support filtering by date range (weekStart/weekEnd)
- Frontend currently requests limit: 1000 to fetch all slots for client-side filtering
- Consider implementing server-side filtering by status if needed for performance

---

### 3. Get Slot Statistics

**GET** `/slot/stats/my-slots`

Retrieves statistics about the freelancer's slots.

**Response:**

```typescript
{
  success: boolean;
  data: {
    totalSlots: number;                 // Total number of slots
    bookedSlots: number;                // Number of booked slots
    availableSlots: number;             // Number of available slots
    revenue: number;                    // Total revenue from booked slots
    subscriptionInfo?: {                // Optional: Subscription information
      isUnlimited: boolean;
      remainingSlots: number;
      maxSlots: number | null;
    };
  };
  message?: string;
}
```

**Notes:**

- Revenue should be calculated from completed/booked slots
- Statistics should be real-time or cached with short TTL (5 minutes)
- Include subscription limit information if applicable

---

### 4. Get Single Slot

**POST** `/slot/get`

Retrieves a single slot by ID.

**Request Body:**

```typescript
{
  id: string; // Slot ID (required)
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Slot;                           // Full slot object with booking details
  message?: string;
}
```

**Notes:**

- Should include booking information if the slot is booked
- Include client details if booked

---

### 5. Update Slot

**POST** `/slot/update`

Updates an existing slot.

**Request Body:**

```typescript
{
  id: string;                          // Slot ID (required)
  locationType?: LocationType;
  startTime?: string;                  // ISO 8601 datetime
  endTime?: string;                    // ISO 8601 datetime
  status?: string;                     // 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'CANCELLED'
  additionalFee?: boolean;
  feeAmount?: string;
  feeName?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: Slot;                           // Updated slot object
  message?: string;
}
```

**Notes:**

- Only allow updates if slot is not booked
- Validate time changes don't conflict with existing bookings

---

### 6. Delete Slot

**POST** `/slot/delete`

Deletes a slot.

**Request Body:**

```typescript
{
  id: string; // Slot ID (required)
}
```

**Response:**

```typescript
{
  success: boolean;
  data: void;
  message?: string;
}
```

**Notes:**

- Only allow deletion if slot is not booked
- Soft delete preferred (set status to CANCELLED) or hard delete based on business logic
- Frontend shows confirmation dialog before deletion

---

### 7. Reserve Slot

**POST** `/slot/reserve`

Reserves a slot temporarily (e.g., while user is booking).

**Request Body:**

```typescript
{
  slotId: string; // Slot ID (required)
  reservedUntil: string; // ISO 8601 datetime (required)
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    id: string;                        // Slot ID
    reservedUntil: string;              // ISO 8601 datetime
  };
  message?: string;
}
```

**Notes:**

- Used during booking flow to prevent double-booking
- Slot status should change to 'RESERVED'
- Reservation should expire automatically after reservedUntil time

---

### 8. Get Available Slots (Public)

**GET** `/slot/available/:freelancerId`

Retrieves available slots for a specific freelancer (public endpoint for booking).

**URL Parameters:**

- `freelancerId`: string (required)

**Query Parameters:**

- Optional filtering parameters

**Response:**

```typescript
{
  success: boolean;
  data: Slot[];                        // Array of available slots only
  message?: string;
}
```

**Notes:**

- Should only return slots with status 'AVAILABLE'
- Used by clients to view available booking slots
- May include date range filtering
- **Tier-Based Filtering**: Apply tier-based day filtering when returning slots:
  - Primary: Respect freelancer's selected days (from their availability configuration)
  - Fallback: If freelancer has configured more days than their tier allows, show only the first N days:
    - Bronze: Show first 3 days (Monday-Wednesday based on day order)
    - Silver: Show first 5 days (Monday-Friday)
    - Gold: Show all configured days
  - Example: If Bronze freelancer selected Mon, Wed, Fri (3 days), show all 3. If they somehow have 5 days configured, show only Mon, Tue, Wed.
- **Blocked Dates**: Exclude slots on blocked dates (see Blocked Dates endpoints below)

---

## Blocked Dates Endpoints

### 12. Get Blocked Dates

**GET** `/freelancer/availability/blocked-days`

Retrieves all blocked dates for the authenticated freelancer.

**Response:**

```typescript
{
  success: boolean;
  data: {
    blockedDates: Array<{
      id: string;
      date: string; // ISO date string (YYYY-MM-DD)
      reason?: string; // Optional reason for blocking
      createdAt: string;
      updatedAt: string;
    }>;
  };
  message?: string;
}
```

**Notes:**

- Returns all dates that are blocked (soft block - hidden from clients)
- Blocked dates hide slots from client view but slots remain in system
- Used for vacations, holidays, or temporary unavailability

---

### 13. Block Dates

**POST** `/freelancer/availability/block-days`

Blocks one or more dates to hide slots from clients.

**Request Body:**

```typescript
{
  dates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  reason?: string; // Optional reason for blocking
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    blockedDates: Array<{
      id: string;
      date: string;
      reason?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  message?: string;
}
```

**Notes:**

- Blocks specified dates (soft block)
- Slots on blocked dates remain in database but are hidden from clients
- Can block multiple dates in one request
- Dates should be in YYYY-MM-DD format
- Validate that dates are not in the past

---

### 14. Unblock Dates

**DELETE** `/freelancer/availability/block-days`

Unblocks one or more dates to make slots visible to clients again.

**Request Body:**

```typescript
{
  dates: string[]; // Array of ISO date strings (YYYY-MM-DD) to unblock
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    blockedDates: Array<{
      id: string;
      date: string;
      reason?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  message?: string;
}
```

**Notes:**

- Unblocks specified dates
- Slots on unblocked dates become visible to clients again
- Can unblock multiple dates in one request
- Returns updated list of blocked dates

---

## Data Types

### LocationType Enum

```typescript
'HOME' | 'CLINIC' | 'ONLINE';
```

### Slot Status Enum

```typescript
'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'CANCELLED';
```

---

## Authentication

All endpoints (except `/slot/available/:freelancerId`) require authentication:

- Include JWT token in Authorization header: `Bearer <token>`
- User must have role: `FREELANCER` for creating/managing their own slots
- Admin users may need access to all slots

---

## Error Responses

All endpoints should return consistent error responses:

```typescript
{
  success: false;
  message: string;                     // Error message
  error?: {
    code: string;
    details?: any;
  };
}
```

**Common Error Codes:**

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't have permission
- `VALIDATION_ERROR`: Invalid request data
- `SLOT_LIMIT_REACHED`: Freelancer has reached subscription slot limit
- `SLOT_ALREADY_BOOKED`: Slot cannot be modified/deleted because it's booked
- `INVALID_TIME_RANGE`: Start time must be before end time
- `SLOT_CONFLICT`: Slot time conflicts with existing slot
- `TIER_DAY_LIMIT_EXCEEDED`: Freelancer attempted to create slots for more days than their tier allows

---

## Business Rules

1. **Slot Creation:**
   - Freelancer must have active subscription or be in trial
   - Check subscription limits before creating slots
   - Validate time ranges (startTime < endTime)
   - Prevent overlapping slots for the same freelancer
   - **Pricing**: Automatically calculate price from account-level pricing:
     - If service categories are provided, use service pricing (sum of prices for all categories)
     - Otherwise, use duration-based pricing for the slot duration
     - Validate that pricing exists for the specified services/duration
     - Return error if pricing is not configured for the requested services/duration

2. **Slot Updates:**
   - Cannot update booked slots
   - Cannot update slots that are in the past
   - Time changes must not conflict with existing bookings

3. **Slot Deletion:**
   - Cannot delete booked slots
   - Cannot delete slots that are in the past
   - Consider notifying clients if slot is deleted

4. **Slot Status:**
   - `AVAILABLE`: Slot is open for booking
   - `RESERVED`: Slot is temporarily reserved during booking flow
   - `BOOKED`: Slot has been booked by a client
   - `CANCELLED`: Slot has been cancelled

5. **Subscription Limits:**
   - Check slot limits based on subscription plan
   - Some plans may have unlimited slots (maxSlots = null)
   - Track slots used vs. slots limit

6. **Pricing Management:**
   - Freelancers must set pricing before creating slots
   - Service pricing: Set prices for each service they offer
   - Duration pricing: Set prices for different slot durations (30min, 60min, etc.)
   - Pricing is account-level and applies to all slots created
   - Slots calculate price automatically based on:
     - Service categories assigned to slot → use service pricing
     - Slot duration → use duration pricing (if no service categories)
   - Backend should validate pricing exists before allowing slot creation

7. **Tier Restrictions:**
   - Bronze tier: Maximum 3 days per week (freelancer can choose any 3 days)
   - Silver tier: Maximum 5 days per week (freelancer can choose any 5 days)
   - Gold tier: All 7 days allowed
   - At slot creation: Validate that freelancer doesn't exceed their tier's day limit
   - At client display: Apply tier filtering to show only allowed days
   - If freelancer has more days configured than tier allows, show only first N days (fallback)

8. **Blocked Dates (Soft Blocking):**
   - Freelancers can block specific dates to hide slots from clients
   - Blocked dates are soft blocks - slots remain in database, just hidden from client view
   - When returning slots to clients, exclude slots on blocked dates
   - Blocked dates can be unblocked later to make slots visible again
   - Use cases: vacations, holidays, temporary unavailability

---

## Frontend Integration Notes

1. **Slot Creation Flow:**
   - Frontend generates slots from day configurations
   - Sends batch of slots in single API call
   - Expects all slots to be created atomically

2. **Slot Listing:**
   - Frontend fetches all slots (limit: 1000) for client-side filtering
   - Filters by status on frontend
   - Consider implementing server-side filtering if performance becomes an issue

3. **Real-time Updates:**
   - Frontend uses React Query for caching and refetching
   - Stats are cached for 5 minutes
   - Consider WebSocket updates for real-time slot status changes

4. **Pagination:**
   - Currently frontend handles pagination client-side
   - Backend should support pagination for future optimization

---

## Testing Checklist

- [ ] Create slots with valid data
- [ ] Reject slot creation when limit is reached
- [ ] Reject slot creation with invalid time ranges
- [ ] Reject slot creation with overlapping times
- [ ] Update slot successfully
- [ ] Reject update of booked slot
- [ ] Delete slot successfully
- [ ] Reject deletion of booked slot
- [ ] Get slots with pagination
- [ ] Get slot statistics accurately
- [ ] Reserve slot and auto-expire reservation
- [ ] Filter slots by status
- [ ] Filter slots by date range
- [ ] Handle subscription limits correctly

---

## Additional Considerations

1. **Performance:**
   - Consider indexing on `freelancerId`, `startTime`, `status`
   - Cache statistics with short TTL
   - Optimize queries for date range filtering

2. **Notifications:**
   - Consider sending notifications when slots are created/updated/deleted
   - Notify clients if their booked slot is cancelled

3. **Audit Logging:**
   - Log all slot creation, updates, and deletions
   - Track who made changes and when

4. **Timezone Handling:**
   - Ensure all datetime fields are stored in UTC
   - Convert to user's timezone on frontend
   - Handle daylight saving time correctly

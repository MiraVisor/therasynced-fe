# GDPR Compliance Implementation — Frontend Integration Guide

## Overview

All endpoints require JWT authentication (Bearer token). Base URL: `/api/v1`

---

## Critical Priority Endpoints

### 1. Data Export (Right of Access)

**GET** `/api/v1/data-rights/export`

**Response Structure:**

```json
{
  "success": true,
  "message": "User data exported successfully",
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "gender": "MALE",
      "dob": "1990-01-01T00:00:00.000Z",
      "city": "Dublin",
      "role": "PATIENT",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "isEmailVerified": true,
      "authProvider": "LOCAL"
    },
    "bookings": [...],
    "messages": [...],
    "complaints": {
      "reported": [...],
      "received": [...]
    },
    "healthData": {
      "firstAidCertificate": {...},
      "consents": [...]
    },
    "payments": {
      "subscription": {...},
      "stripeCustomerId": "...",
      "bookingAmounts": [...]
    },
    "preferences": {
      "favorites": [...],
      "loyaltyProfile": {...}
    },
    "ratings": {
      "given": [...],
      "received": [...]
    },
    "notifications": [...],
    "cookieConsent": {...}
  }
}
```

**Note:** If user is anonymized, returns: `{ "message": "User data has been anonymized", "anonymized": true }`

---

### 2. Account Deletion (Right to Erasure)

**DELETE** `/api/v1/data-rights/delete-account`

**Request Body:**

```json
{
  "password": "userpassword" // Optional - for password confirmation
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully. Healthcare and financial records retained for 7 years as required by law.",
  "data": {
    "deletedAt": "2024-12-13T16:00:00.000Z"
  }
}
```

**Important Logic:**

- Soft delete (user is anonymized, not permanently deleted)
- Healthcare records (completed bookings) retained for 7 years
- Financial records (subscriptions, payments) retained for 7 years
- Messages older than 2 years are deleted immediately
- User should be logged out after successful deletion

---

### 3. Health Data Consent Management

#### 3a. Update Health Data Consent

**POST** `/api/v1/consent/health-data`

**Request Body:**

```json
{
  "consentType": "MEDICAL_HISTORY" | "SOAP_NOTES" | "COMPLAINTS" | "FIRST_AID_CERTIFICATE",
  "granted": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Health data consent updated successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "consentType": "MEDICAL_HISTORY",
    "granted": true,
    "grantedAt": "2024-12-13T16:00:00.000Z",
    "withdrawnAt": null
  }
}
```

#### 3b. Get Health Data Consent Status

**GET** `/api/v1/consent/health-data`

**Response:**

```json
{
  "success": true,
  "message": "Health data consent status retrieved successfully",
  "data": {
    "consents": [
      {
        "consentType": "MEDICAL_HISTORY",
        "granted": true,
        "grantedAt": "2024-12-13T16:00:00.000Z",
        "withdrawnAt": null
      },
      {
        "consentType": "SOAP_NOTES",
        "granted": false,
        "grantedAt": null,
        "withdrawnAt": null
      }
      // ... all consent types
    ]
  }
}
```

**Important:** Check consent before displaying/processing health data. All 4 consent types are returned (granted or not).

---

## High Priority Endpoints

### 4. Data Portability

**GET** `/api/v1/data-rights/export-portable?format=json` or `?format=csv`

**Query Parameters:**

- `format` (optional): `"json"` (default) or `"csv"`

**Response:** Same data structure as export endpoint, or CSV string if format=csv

---

### 5. Restrict Processing

**POST** `/api/v1/data-rights/restrict-processing`

**Request Body:**

```json
{
  "reason": "User requested restriction due to privacy concerns",
  "dataCategories": ["analytics", "marketing", "profiling"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Processing restricted successfully",
  "data": {
    "restrictedCategories": ["analytics", "marketing", "profiling"]
  }
}
```

**Frontend Logic:**

- Stop analytics tracking for this user
- Stop marketing communications
- Respect the restricted categories

---

### 6. Object to Processing

**POST** `/api/v1/data-rights/object-processing`

**Request Body:**

```json
{
  "processingType": "analytics", // e.g., "analytics", "marketing", "profiling"
  "reason": "User objects to analytics tracking"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Objection to processing registered successfully",
  "data": {
    "objectedProcessingTypes": ["analytics"]
  }
}
```

**Frontend Logic:**

- Stop the specific processing type (analytics, marketing, etc.)
- Can object to multiple types (array accumulates)

---

## Optional Endpoints

### 7. Cookie Consent Storage

**POST** `/api/v1/consent/cookies`

**Request Body:**

```json
{
  "essential": true, // Always true (required for app functionality)
  "analytics": false,
  "marketing": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Cookie consent stored successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "essential": true,
    "analytics": false,
    "marketing": false
  }
}
```

**Frontend Logic:**

- Sync cookie consent across devices
- Store in backend (in addition to localStorage)
- Respect these preferences when setting cookies

---

## Admin-Only Endpoints

### 8. Log Data Breach

**POST** `/api/v1/data-rights/breaches` (Admin only)

**Request Body:**

```json
{
  "description": "Unauthorized access detected",
  "dataCategories": ["personal_data", "health_data"],
  "affectedUsers": 150,
  "riskLevel": "HIGH" // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}
```

---

### 9. Get ROPA Report

**GET** `/api/v1/data-rights/ropa` (Admin only)

**Response:** Records of Processing Activities report

---

## Important Frontend Implementation Notes

### 1. Health Data Consent Enforcement

- Before displaying health data (complaints, medical history, SOAP notes, first aid certificates), check if consent is granted
- Use `GET /api/v1/consent/health-data` to check consent status
- Show consent request UI if consent is not granted
- Update consent via `POST /api/v1/consent/health-data` when user grants/withdraws

### 2. Account Deletion Flow

1. Show warning about 7-year retention for healthcare/financial records
2. Optional: Request password confirmation
3. Call `DELETE /api/v1/data-rights/delete-account`
4. Log user out immediately after successful deletion
5. Show confirmation message

### 3. Data Export Flow

1. User requests data export
2. Call `GET /api/v1/data-rights/export`
3. Display data in a readable format OR
4. Offer download as JSON file
5. For CSV format, use `GET /api/v1/data-rights/export-portable?format=csv`

### 4. Processing Restrictions

- Check user's `processingRestricted` flag (if available in user profile)
- If restricted, disable analytics, marketing, and other restricted categories
- Respect `processingRestrictedCategories` array

### 5. Objection to Processing

- Check user's `objectedToProcessing` flag
- Respect `objectedProcessingTypes` array
- Stop specific processing types (analytics, marketing, etc.)

### 6. Cookie Consent

- On app load, check if cookie consent exists
- If not, show cookie consent banner
- Store consent via `POST /api/v1/consent/cookies`
- Also store in localStorage for immediate access
- Respect consent preferences when setting cookies

---

## Response Format

All endpoints follow this standard response format:

```json
{
  "success": true,
  "message": "Operation message",
  "data": { ... },
  "meta": {
    "timestamp": "2024-12-13T16:00:00.000Z",
    "path": "/api/v1/endpoint"
  }
}
```

---

## Error Handling

- 401 Unauthorized: Invalid or missing JWT token
- 403 Forbidden: User doesn't have permission (e.g., admin endpoints)
- 404 Not Found: Resource not found
- 400 Bad Request: Invalid request body/parameters

All endpoints are documented in Swagger at `/api/docs` (if Swagger is enabled).

---

## Next Steps for Frontend

1. Create GDPR settings page with:
   - Data export button
   - Account deletion option
   - Health data consent management
   - Processing restrictions/objections
   - Cookie consent preferences
2. Implement consent checks before displaying health data
3. Add cookie consent banner on first visit
4. Respect processing restrictions and objections throughout the app
5. Handle account deletion flow with proper warnings

All endpoints are ready to use. The migration needs to be applied to the database first.

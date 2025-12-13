# Backend Work Required - GDPR Compliance

## Summary

This document lists ALL backend work required to support GDPR compliance features.

**Total APIs Needed:** 7 endpoints  
**Total Database Tables:** 5 new tables  
**Priority:** Critical (3), High (4), Medium (3), Optional (1)

---

## CRITICAL PRIORITY (Must Implement Now)

### 1. Data Export API

**Endpoint:** `GET /api/v1/data-rights/export`  
**Authentication:** Required (JWT Bearer token)  
**Response:** All user data in JSON format

**Response Structure:**

```json
{
  "success": true,
  "message": "User data exported successfully",
  "data": {
    "profile": {
      /* user profile data */
    },
    "bookings": [
      /* all bookings */
    ],
    "messages": [
      /* all messages */
    ],
    "complaints": {
      "reported": [
        /* complaints user reported */
      ],
      "received": [
        /* complaints against user */
      ]
    },
    "healthData": {
      "firstAidCertificate": {
        /* if applicable */
      },
      "consents": [
        /* health data consents */
      ]
    },
    "payments": {
      "subscription": {
        /* subscription data */
      },
      "stripeCustomerId": "string",
      "bookingAmounts": [
        /* payment history */
      ]
    },
    "preferences": {
      "favorites": [
        /* favorited freelancers */
      ],
      "loyaltyProfile": {
        /* loyalty data */
      }
    },
    "ratings": {
      "given": [
        /* ratings user gave */
      ],
      "received": [
        /* ratings user received */
      ]
    },
    "notifications": [
      /* all notifications */
    ],
    "cookieConsent": {
      /* cookie preferences */
    }
  }
}
```

**Special Case:** If user is anonymized, return:

```json
{
  "message": "User data has been anonymized",
  "anonymized": true
}
```

**Requirements:**

- Include ALL user data across all tables
- Include health data only if consent granted
- Format as JSON (machine-readable)
- Response time: Should complete within 30 days (GDPR requirement)

---

### 2. Account Deletion API

**Endpoint:** `DELETE /api/v1/data-rights/delete-account`  
**Authentication:** Required (JWT Bearer token)  
**Request Body (Optional):**

```json
{
  "password": "userpassword"
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

**Critical Requirements:**

1. **Soft Delete:** Anonymize user, don't permanently delete
2. **7-Year Retention:** Healthcare records (completed bookings) must be retained for 7 years
3. **7-Year Retention:** Financial records (subscriptions, payments) must be retained for 7 years
4. **Immediate Deletion:** Messages older than 2 years can be deleted immediately
5. **Anonymization:** Replace personal data with anonymized values
6. **Log Deletion:** Record deletion request for audit

**Data Handling:**

- Profile: Anonymize (replace name, email with "Anonymized User #123")
- Bookings: Retain for 7 years (link to anonymized user)
- Messages: Delete if older than 2 years, otherwise retain
- Health Data: Retain for 7 years
- Payments: Retain for 7 years

---

### 3. Health Data Consent APIs

#### 3a. Update Health Data Consent

**Endpoint:** `POST /api/v1/consent/health-data`  
**Authentication:** Required  
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

**Endpoint:** `GET /api/v1/consent/health-data`  
**Authentication:** Required  
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
      },
      {
        "consentType": "COMPLAINTS",
        "granted": false,
        "grantedAt": null,
        "withdrawnAt": null
      },
      {
        "consentType": "FIRST_AID_CERTIFICATE",
        "granted": false,
        "grantedAt": null,
        "withdrawnAt": null
      }
    ]
  }
}
```

**Critical Requirements:**

- Store explicit consent for each health data type
- Record consent timestamp
- Allow withdrawal (set `withdrawnAt` when `granted: false`)
- **ENFORCE CONSENT:** Check consent before processing health data
- Return all 4 consent types (granted or not)

---

## HIGH PRIORITY (Within 2 Weeks)

### 4. Data Portability API

**Endpoint:** `GET /api/v1/data-rights/export-portable?format=json|csv`  
**Authentication:** Required  
**Query Parameters:**

- `format` (optional): `"json"` (default) or `"csv"`

**Response:**

- If `format=json`: Same as data export endpoint
- If `format=csv`: CSV string (for tabular data)

**Requirements:**

- Machine-readable format
- Can be imported into another system
- Support multiple formats (JSON, CSV)

---

### 5. Restrict Processing API

**Endpoint:** `POST /api/v1/data-rights/restrict-processing`  
**Authentication:** Required  
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

**Requirements:**

- Flag user account to restrict processing
- Stop processing specified data categories
- Store restriction in user profile or separate table
- Allow resumption when restriction lifted

---

### 6. Object to Processing API

**Endpoint:** `POST /api/v1/data-rights/object-processing`  
**Authentication:** Required  
**Request Body:**

```json
{
  "processingType": "analytics", // "analytics" | "marketing" | "profiling"
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

**Requirements:**

- Stop processing based on legitimate interest
- Store objections in user profile or separate table
- Can object to multiple types (array accumulates)
- Respect objections throughout the application

---

### 7. Health Data Access Logging

**Purpose:** Audit trail for health data access (GDPR requirement)

**Database Table:** `health_data_access_logs`

```sql
CREATE TABLE health_data_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Data owner
  accessed_by UUID NOT NULL, -- Who accessed the data
  data_type VARCHAR NOT NULL, -- Type of health data accessed
  data_id UUID, -- ID of the specific data record
  purpose TEXT, -- Purpose of access
  ip_address VARCHAR,
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (accessed_by) REFERENCES users(id)
);

CREATE INDEX idx_health_data_access_user ON health_data_access_logs(user_id);
CREATE INDEX idx_health_data_access_by ON health_data_access_logs(accessed_by);
CREATE INDEX idx_health_data_access_time ON health_data_access_logs(accessed_at);
```

**Requirements:**

- Log ALL access to health data
- Include: who, what, when, why, IP address, user agent
- Queryable for audit purposes
- Retention: Minimum 3 years

---

## MEDIUM PRIORITY (Within 1 Month)

### 8. Automated Data Retention

**Purpose:** Delete data after retention periods

**Implementation:**

- Scheduled job/cron task (run daily or weekly)
- Check retention dates
- Delete/anonymize expired data

**Retention Rules:**

- Healthcare records: 7 years (Irish legal requirement)
- Financial records: 7 years
- Messages: 2 years
- Analytics: 2 years (anonymized)

**Requirements:**

- Respect legal requirements (cannot delete before retention period)
- Log all deletions
- Soft delete where possible (anonymize instead of hard delete)

---

### 9. Data Breach Detection & Logging

**Purpose:** Monitor and log potential breaches

**Database Table:** `data_breaches`

```sql
CREATE TABLE data_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  data_categories TEXT[] NOT NULL, -- ["personal_data", "health_data"]
  affected_users INTEGER NOT NULL,
  risk_level VARCHAR NOT NULL, -- "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status VARCHAR NOT NULL, -- "DETECTED" | "INVESTIGATING" | "CONTAINED" | "RESOLVED"
  reported_to_dpc BOOLEAN DEFAULT FALSE,
  reported_at TIMESTAMP,
  notified_users BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Admin Endpoint:** `POST /api/v1/data-rights/breaches` (Admin only)
**Request Body:**

```json
{
  "description": "Unauthorized access detected",
  "dataCategories": ["personal_data", "health_data"],
  "affectedUsers": 150,
  "riskLevel": "HIGH"
}
```

**Requirements:**

- Monitor suspicious activity
- Log potential breaches
- Alert system for security team
- Track DPC notification status
- Track user notification status

---

### 10. Records of Processing Activities (ROPA)

**Purpose:** Maintain processing activity records (GDPR Article 30)

**Database Tables:**

```sql
CREATE TABLE processing_activities_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type VARCHAR NOT NULL,
  data_categories TEXT[] NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis VARCHAR NOT NULL, -- "CONTRACT" | "CONSENT" | "LEGITIMATE_INTEREST"
  data_subjects_count INTEGER,
  retention_period VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_processors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  contact_details TEXT,
  location VARCHAR,
  processing_activities TEXT[],
  dpa_signed BOOLEAN DEFAULT FALSE,
  dpa_signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Admin Endpoint:** `GET /api/v1/data-rights/ropa` (Admin only)
**Response:** Records of Processing Activities report

**Requirements:**

- Log all data processing events
- Generate ROPA reports
- Export for DPC requests
- Maintain processor records

---

## OPTIONAL (Low Priority)

### 11. Server-Side Cookie Consent Storage

**Endpoint:** `POST /api/v1/consent/cookies`  
**Authentication:** Required  
**Request Body:**

```json
{
  "essential": true, // Always true
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

**Purpose:** Sync cookie consent across devices  
**Note:** Currently stored in localStorage only. This is optional enhancement.

---

## Database Tables Required

### 1. `health_data_consent`

```sql
CREATE TABLE health_data_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type VARCHAR NOT NULL, -- "MEDICAL_HISTORY" | "SOAP_NOTES" | "COMPLAINTS" | "FIRST_AID_CERTIFICATE"
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  granted_at TIMESTAMP,
  withdrawn_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, consent_type)
);
```

### 2. `health_data_access_logs`

(Defined in section 7 above)

### 3. `data_breaches`

(Defined in section 9 above)

### 4. `data_rights_requests`

```sql
CREATE TABLE data_rights_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type VARCHAR NOT NULL, -- "ACCESS" | "PORTABILITY" | "ERASURE" | "RESTRICT" | "OBJECT"
  status VARCHAR NOT NULL, -- "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED"
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  response_data JSONB,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5. `processing_activities_log`

(Defined in section 10 above)

### 6. `data_processors`

(Defined in section 10 above)

### 7. `cookie_consent` (Optional)

```sql
CREATE TABLE cookie_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  essential BOOLEAN NOT NULL DEFAULT TRUE,
  analytics BOOLEAN NOT NULL DEFAULT FALSE,
  marketing BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id)
);
```

---

## Security Requirements

1. **Authentication:** All endpoints require JWT Bearer token
2. **Authorization:** Users can only access their own data
3. **Rate Limiting:** Limit data export/deletion requests (prevent abuse)
4. **Password Confirmation:** Optional password confirmation for account deletion
5. **Audit Trail:** Log all data rights requests
6. **IP Logging:** Log IP addresses for security

---

## Legal Requirements to Respect

1. **30-Day Response:** Respond to data subject requests within 30 days (GDPR Article 12(3))
2. **7-Year Retention:** Healthcare records must be retained for 7 years (Irish law)
3. **7-Year Retention:** Financial records must be retained for 7 years
4. **Explicit Consent:** Health data requires explicit consent (cannot be implied)
5. **Data Minimization:** Only collect and process necessary data

---

## Implementation Checklist

### Critical (Do First)

- [ ] Implement data export API
- [ ] Implement account deletion API (with retention logic)
- [ ] Implement health data consent APIs
- [ ] Create `health_data_consent` table
- [ ] Create `health_data_access_logs` table
- [ ] Enforce consent before processing health data

### High Priority (Within 2 Weeks)

- [ ] Implement data portability API
- [ ] Implement restrict processing API
- [ ] Implement object to processing API
- [ ] Create `data_rights_requests` table
- [ ] Implement health data access logging

### Medium Priority (Within 1 Month)

- [ ] Implement automated data retention job
- [ ] Implement breach detection system
- [ ] Create `data_breaches` table
- [ ] Implement ROPA generation
- [ ] Create `processing_activities_log` table
- [ ] Create `data_processors` table

### Optional

- [ ] Implement server-side cookie consent storage
- [ ] Create `cookie_consent` table

---

## Testing Requirements

### Unit Tests

- Test data export includes all user data
- Test account deletion respects retention requirements
- Test consent enforcement
- Test access logging

### Integration Tests

- Test full data export flow
- Test account deletion flow
- Test consent management flow
- Test processing restrictions

### Security Tests

- Test authentication on all endpoints
- Test authorization (users can only access own data)
- Test rate limiting
- Test password confirmation

---

## API Response Format

All endpoints follow this standard format:

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

**Error Response:**

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

---

## Estimated Implementation Time

- **Critical:** 1-2 weeks (3 endpoints + 2 tables)
- **High Priority:** 2-3 weeks (3 endpoints + 1 table + logging)
- **Medium Priority:** 3-4 weeks (automation + breach system + ROPA)
- **Total:** ~6-8 weeks for full implementation

---

**Last Updated:** January 2025  
**Status:** ⚠️ Backend Implementation Required

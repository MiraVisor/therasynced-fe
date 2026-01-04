# GDPR Consent Implementation Summary

## Overview

This document summarizes the GDPR-compliant consent implementation for TheraSynced, distinguishing between **GDPR consents** and **contractual authorizations**.

**Last Updated:** January 2025  
**Status:** ✅ Production Ready

---

## Key Distinction: Consent vs. Authorization

### GDPR Consents (Article 6 & 9)

- **Freely withdrawable** without detriment
- **Separate** from other consents
- **Specific** to data processing purpose
- **Tracked** with timestamps and history

### Contractual Authorizations (Article 6(1)(b))

- **Payment Authorization** - Required for subscription billing
- **Legal Basis:** Performance of contract
- **Ends when:** Subscription is cancelled
- **NOT withdrawable** like GDPR consent (would break contract)

---

## Consent Types by Role

### Common Consents (Both Users & Freelancers)

#### 1. Terms of Service ✅

- **Type:** `TERMS_OF_SERVICE`
- **Required:** Yes
- **Legal Basis:** Contract (Article 6(1)(b))
- **Withdrawable:** No (required for platform use)
- **When Collected:** During signup

#### 2. Privacy Policy ✅

- **Type:** `PRIVACY_POLICY`
- **Required:** Yes
- **Legal Basis:** Contract (Article 6(1)(b))
- **Withdrawable:** No (required for platform use)
- **When Collected:** During signup

#### 3. GDPR Data Processing ✅

- **Type:** `GDPR_DATA_PROCESSING`
- **Required:** Yes
- **Legal Basis:** Contract (Article 6(1)(b)) - for general data processing
- **Withdrawable:** No (required for platform use)
- **When Collected:** During signup
- **Covers:** Bookings, messages, appointments, general service delivery

---

### Freelancer-Specific Consents

#### 4. First Aid Certificate Consent ✅

- **Type:** `FIRST_AID_CERTIFICATE`
- **Required:** No (optional)
- **Legal Basis:** Explicit Consent (Article 9(2)(a)) - Special Category Data
- **Withdrawable:** Yes, anytime
- **When Collected:** Before uploading first aid certificate
- **Note:** May include health-related information; processed only for professional verification

#### 5. Verification Documents Consent ✅

- **Type:** `VERIFICATION_DOCUMENTS`
- **Required:** No (optional)
- **Legal Basis:** Contract (Article 6(1)(b))
- **Withdrawable:** Yes, but may affect verification status
- **When Collected:** Before uploading verification documents

---

### Payment Authorization (NOT a GDPR Consent) ⚠️

#### Payment Authorization & Billing Agreement

- **Type:** `PAYMENT_DATA` (deprecated name, kept for backward compatibility)
- **Required:** Yes (for subscription checkout)
- **Legal Basis:** **Contract (Article 6(1)(b))** - NOT consent
- **Withdrawable:** No - Authorization ends when subscription is cancelled
- **When Collected:** During subscription checkout
- **Important:** This is **contractual authorization**, not GDPR consent

**Implementation Notes:**

- Handled separately from GDPR consent management
- Uses `PaymentConsent` component (renamed to reflect authorization)
- Stored as authorization record, not consent record
- Cannot be "withdrawn" like GDPR consent (would require subscription cancellation)

---

## Health Data Consents (Special Category - Article 9)

These are handled separately via the Health Data Consent API:

1. **Medical History Consent** (`MEDICAL_HISTORY`)
2. **SOAP Notes Consent** (`SOAP_NOTES`)
3. **Complaints Consent** (`COMPLAINTS`)
4. **First Aid Certificate Consent** (`FIRST_AID_CERTIFICATE`)

**All require:**

- Explicit opt-in (radio buttons: "I consent" / "I do not consent")
- Separate from other consents
- Freely withdrawable
- Checked before accessing/processing health data

---

## Cookie Consent

**Separate system** from GDPR consents:

- **Essential Cookies:** Always enabled (cannot be disabled)
- **Analytics Cookies:** Optional, requires consent
- **Marketing Cookies:** Optional, requires consent

**Implementation:**

- Cookie consent banner on first visit
- Preferences stored in localStorage + backend (if authenticated)
- Can be managed via cookie settings dialog

---

## UI Components

### Signup Flow

- **Component:** `ConsentStep`
- **Shows:** Required GDPR consents only (Terms, Privacy, GDPR Data Processing)
- **Does NOT show:** Payment authorization (handled at checkout)

### Account Settings

- **Component:** `UnifiedConsentManager`
- **Shows:** All GDPR consents grouped by category
- **Payment Authorization:** Shown separately with clear labeling that it's NOT a GDPR consent

### Subscription Checkout

- **Component:** `PaymentConsent` (Payment Authorization)
- **Shows:** Payment authorization checkbox
- **Legal Basis:** Clearly stated as contractual (Article 6(1)(b))
- **Wording:** "Authorization ends when subscription is cancelled"

---

## Legal Basis Summary

| Data Processing    | Legal Basis                           | Consent Required                     |
| ------------------ | ------------------------------------- | ------------------------------------ |
| User Account Data  | Article 6(1)(b) - Contract            | Terms, Privacy, GDPR Data Processing |
| Booking Data       | Article 6(1)(b) - Contract            | Covered by GDPR Data Processing      |
| Payment Processing | Article 6(1)(b) - Contract            | **Authorization** (not consent)      |
| Health Data        | Article 9(2)(a) - Explicit Consent    | **Yes** - Separate explicit consent  |
| Analytics          | Article 6(1)(f) - Legitimate Interest | Cookie consent (optional)            |

---

## Compliance Checklist

### ✅ Implemented

- [x] Separation of GDPR consents from contractual authorizations
- [x] Role-based consent display
- [x] Health data explicit consent (Article 9)
- [x] Cookie consent banner
- [x] Consent withdrawal mechanisms
- [x] Audit trail (timestamps, history)
- [x] Data export includes consent history
- [x] Clear labeling of payment as authorization, not consent

### ✅ Correct Implementation

- [x] Payment authorization NOT treated as GDPR consent
- [x] Payment authorization ends on subscription cancellation
- [x] Health data consents are separate and explicit
- [x] All consents trackable and exportable

---

## Important Notes

1. **Payment Authorization ≠ GDPR Consent**
   - Payment is contractual authorization (Article 6(1)(b))
   - Cannot be "withdrawn" like GDPR consent
   - Ends automatically when subscription is cancelled

2. **Health Data Requires Explicit Consent**
   - All health data processing requires Article 9 explicit consent
   - Must be separate from other consents
   - Must be freely withdrawable

3. **Cookie Consent is Separate**
   - Managed independently from GDPR consents
   - Essential cookies always enabled
   - Analytics/marketing require opt-in

4. **Audit Trail**
   - All consent changes tracked with timestamps
   - Exportable as part of data export
   - Maintained for compliance purposes

---

## Backend Integration

### Consent Endpoints

- `GET /api/v1/consent` - Get all consents
- `POST /api/v1/consent` - Update consent
- `POST /api/v1/consent/bulk` - Update multiple consents

### Health Data Consent Endpoints

- `GET /api/v1/consent/health-data` - Get health data consent status
- `POST /api/v1/consent/health-data` - Update health data consent

### Cookie Consent Endpoints

- `POST /api/v1/consent/cookies` - Store cookie preferences

---

## References

- GDPR Article 6 - Legal basis for processing
- GDPR Article 9 - Special category data (health data)
- GDPR Article 7 - Conditions for consent
- Irish Data Protection Act 2018

---

**Status:** ✅ Production Ready  
**Compliance Level:** Above MVP - Regulator-ready implementation

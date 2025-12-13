# Health Data Protection Measures

## Overview

This document outlines the additional security measures and consent mechanisms implemented for health data processing in compliance with GDPR Article 9 (Special Category Data).

## Legal Basis

Health data is classified as "special category data" under GDPR Article 9. Processing requires:

- **Explicit consent** (Article 9(2)(a))
- Additional security measures
- Enhanced data protection

## Consent Mechanisms

### Explicit Consent Requirements

1. **Separate Consent:** Health data consent must be separate from general terms acceptance
2. **Clear Information:** Users must be informed about:
   - What health data is collected
   - Why it's collected
   - How it's used
   - Who has access
   - How long it's retained
3. **Easy Withdrawal:** Users must be able to withdraw consent at any time
4. **Granular Options:** Different consent for different types of health data:
   - Medical history forms
   - SOAP notes
   - Health-related complaints
   - First aid certificates

### Implementation

- Consent checkboxes on medical forms
- Separate consent section in account settings
- Clear explanation of data use
- One-click withdrawal mechanism

## Security Measures

### Encryption

- **In Transit:** All health data transmitted via HTTPS/TLS 1.2+
- **At Rest:** Health data encrypted in database (backend responsibility)
- **Backup Encryption:** Encrypted backups for health data

### Access Controls

- **Role-Based Access:** Only authorized healthcare professionals can access patient health data
- **Audit Logging:** All access to health data is logged
- **Minimum Access:** Users only see health data necessary for their role
- **Authentication:** Strong authentication required for health data access

### Data Minimization

- Only collect health data necessary for service delivery
- Regular review of collected data
- Automatic deletion of unnecessary data
- Anonymization where possible

### Retention

- **Medical Records:** 7 years (Irish legal requirement)
- **SOAP Notes:** 7 years
- **Health Complaints:** 7 years
- **First Aid Certificates:** Until account deletion + 7 years

## Data Sharing

### With Healthcare Professionals

- Health data shared only with the healthcare professional providing the service
- Limited to data necessary for the appointment
- Healthcare professionals bound by confidentiality agreements

### Third-Party Processors

- All third-party processors must have Data Processing Agreements (DPAs)
- Processors must be GDPR compliant
- Health data only shared with processors necessary for service delivery
- Regular audits of processor compliance

## User Rights

### Right to Access

Users can request access to all their health data through the Data Rights dashboard.

### Right to Rectification

Users can correct inaccurate health data through their account or by contacting support.

### Right to Erasure

Users can request deletion of health data, subject to legal retention requirements (7 years for medical records).

### Right to Restrict Processing

Users can request restriction of health data processing in certain circumstances.

### Right to Data Portability

Users can export their health data in a structured, machine-readable format.

### Right to Withdraw Consent

Users can withdraw consent for health data processing at any time through account settings.

## Breach Notification

In the event of a health data breach:

- **72-hour notification** to Irish Data Protection Commission
- **Without undue delay** notification to affected individuals if high risk
- Detailed breach report including:
  - Nature of breach
  - Categories of data affected
  - Number of individuals affected
  - Measures taken to address breach

## Compliance Monitoring

- Regular security audits
- Access log reviews
- Consent mechanism testing
- Staff training on health data protection
- Annual compliance review

## Contact

For questions about health data protection:

- Email: privacy@therasynced.com
- Data Protection Officer: [To be appointed if required]

---

**Last Updated:** January 2025  
**Next Review:** April 2025

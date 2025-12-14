import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'TheraSynced Privacy Policy - How we collect, use, and protect your personal data in compliance with GDPR',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TheraSynced (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
              protecting your privacy and personal data. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our therapy and
              wellness booking platform.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This policy complies with the General Data Protection Regulation (GDPR) (EU) 2016/679
              and the Data Protection Act 2018 (Ireland). The Irish Data Protection Commission (DPC)
              is our supervisory authority.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1.1 Platform Nature
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Important:</strong> TheraSynced is a booking and scheduling platform that
              connects clients with independent healthcare professionals, therapists, and wellness
              providers. We facilitate these connections through our technology platform but do not
              provide medical services, medical advice, diagnosis, or treatment. All healthcare
              services are provided by independent practitioners who are responsible for their own
              professional conduct and services. TheraSynced acts solely as an intermediary platform
              and is not a healthcare provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Data Controller
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>TheraSynced</strong>
              <br />
              Email: privacy@therasynced.com
              <br />
              Address: [Your Business Address]
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this Privacy Policy or wish to exercise your data
              protection rights, please contact us at privacy@therasynced.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.1 Personal Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Profile picture (optional)</li>
              <li>Gender (optional)</li>
              <li>Date of birth (optional)</li>
              <li>City (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.2 Health Information (Special Category Data)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              With your explicit consent, we may collect health-related information including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Medical history forms</li>
              <li>ROM (Range of Motion) Assessment forms</li>
              <li>SOAP (Subjective, Objective, Assessment, Plan) notes</li>
              <li>Health-related complaints or concerns</li>
              <li>First aid certificates (for healthcare professionals)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Important:</strong> Health data is considered &quot;special category
              data&quot; under GDPR Article 9. We only process this data with your explicit,
              informed consent, and you may withdraw this consent at any time.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.3 Booking and Appointment Information
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Appointment dates and times</li>
              <li>Service preferences</li>
              <li>Location preferences (home, clinic, online)</li>
              <li>Payment information (processed securely by third-party payment processors)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.4 Communication Data
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Messages sent through our platform</li>
              <li>Support requests</li>
              <li>Feedback and reviews</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.5 Technical Information
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Usage data and analytics (with consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Legal Basis for Processing
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We process your personal data based on the following legal grounds:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.1 Contract Performance (GDPR Article 6(1)(b))
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We process your data to provide our services, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>User account management</li>
              <li>Booking and appointment scheduling</li>
              <li>Payment processing</li>
              <li>Communication between users and healthcare professionals</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.2 Explicit Consent (GDPR Article 9(2)(a))
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We process health data (special category data) only with your explicit consent. You
              can withdraw this consent at any time through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4.3 Legitimate Interest (GDPR Article 6(1)(f))
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">We may process data for:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Service improvement and analytics (with opt-out option)</li>
              <li>Security and fraud prevention</li>
              <li>Legal compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>To provide and maintain our services</li>
              <li>To process bookings and appointments</li>
              <li>To facilitate communication between users and healthcare professionals</li>
              <li>To process payments</li>
              <li>To send service-related notifications</li>
              <li>To improve our services (with consent)</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell your personal data. We may share your information with:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6.1 Service Providers
            </h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Payment Processors:</strong> Stripe (for payment processing) - data
                processed in accordance with their privacy policy
              </li>
              <li>
                <strong>Cloud Storage:</strong> Cloudinary (for image storage) - data processed in
                accordance with their privacy policy
              </li>
              <li>
                <strong>Hosting Providers:</strong> [Your hosting provider] - data processed under
                Data Processing Agreements
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6.2 Healthcare Professionals
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you book an appointment, relevant information is shared with the healthcare
              professional to facilitate the service. This includes your name, contact information,
              and any health information you have provided with explicit consent.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6.3 Legal Requirements
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may disclose your information if required by law, court order, or government
              regulation, or to protect our rights and safety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your personal data only for as long as necessary:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Account Data:</strong> Until account deletion, plus 7 years for legal
                compliance
              </li>
              <li>
                <strong>Health Records:</strong> 7 years (legal requirement for healthcare records
                in Ireland)
              </li>
              <li>
                <strong>Booking Data:</strong> 7 years (legal requirement)
              </li>
              <li>
                <strong>Payment Records:</strong> 7 years (financial records requirement)
              </li>
              <li>
                <strong>Communication Data:</strong> 2 years after last message
              </li>
              <li>
                <strong>Analytics Data:</strong> 2 years (anonymized)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Your Data Protection Rights (GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Under GDPR, you have the following rights:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.1 Right of Access (Article 15)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can request a copy of all personal data we hold about you. You can access this
              through your account dashboard or by contacting us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.2 Right to Rectification (Article 16)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can correct inaccurate or incomplete data through your account settings or by
              contacting us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.3 Right to Erasure (Article 17) - &quot;Right to be Forgotten&quot;
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can request deletion of your personal data. Note: We may retain certain data for
              legal compliance (e.g., healthcare records for 7 years).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.4 Right to Restrict Processing (Article 18)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can request that we limit how we process your data in certain circumstances.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.5 Right to Data Portability (Article 20)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can request your data in a structured, machine-readable format (JSON/CSV).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.6 Right to Object (Article 21)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can object to processing based on legitimate interests. You can manage this
              through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              8.7 Right to Withdraw Consent
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can withdraw consent for health data processing at any time through your account
              settings. This will not affect the lawfulness of processing before withdrawal.
            </p>

            <p className="text-gray-700 dark:text-gray-300 mb-4 mt-6">
              <strong>Exercising Your Rights:</strong> To exercise any of these rights, contact us
              at privacy@therasynced.com. We will respond within 30 days as required by GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest (backend storage)</li>
              <li>Secure authentication (token-based)</li>
              <li>Regular security assessments</li>
              <li>Access controls and audit logging</li>
              <li>Secure cookie handling</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Despite our efforts, no method of transmission over the Internet is 100% secure. We
              cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your data may be processed outside the European Economic Area (EEA). When this occurs,
              we ensure appropriate safeguards are in place, such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Other approved transfer mechanisms under GDPR</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar technologies. For detailed information, please see our{' '}
              <a href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our services are not intended for individuals under 16 years of age. We do not
              knowingly collect personal data from children. If you believe we have collected data
              from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Data Breach Notification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In the event of a data breach that poses a risk to your rights and freedoms, we will:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Notify the Irish Data Protection Commission within 72 hours</li>
              <li>Notify affected individuals without undue delay if high risk</li>
              <li>Provide details of the breach and measures taken</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by email or through our platform. The &quot;Last Updated&quot; date
              at the top indicates when changes were made.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              15. Complaints
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have concerns about how we handle your personal data, you have the right to
              lodge a complaint with the Irish Data Protection Commission:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Data Protection Commission</strong>
              <br />
              Website: https://www.dataprotection.ie
              <br />
              Email: info@dataprotection.ie
              <br />
              Address: 21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              16. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions about this Privacy Policy or to exercise your rights, contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>TheraSynced</strong>
              <br />
              Email: privacy@therasynced.com
              <br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

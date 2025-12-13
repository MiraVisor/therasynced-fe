import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TheraSynced Terms of Service - Rules and guidelines for using our platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using TheraSynced (&quot;the Platform&quot;, &quot;we&quot;,
              &quot;our&quot;, or &quot;us&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to these Terms, you may not use our services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms constitute a legally binding agreement between you and TheraSynced. Please
              read them carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TheraSynced is an online platform that connects patients with licensed healthcare
              professionals, therapists, and wellness providers. Our services include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Booking and scheduling appointments</li>
              <li>Facilitating communication between users and healthcare professionals</li>
              <li>Payment processing for services</li>
              <li>Profile management for users and healthcare professionals</li>
              <li>Review and rating system</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Important:</strong> TheraSynced operates as an intermediary booking platform
              that facilitates connections between clients and independent healthcare professionals.
              We do not provide medical advice, diagnosis, or treatment services. TheraSynced is not
              a healthcare provider and does not provide medical services. All healthcare services
              are provided by independent practitioners who are responsible for their own
              professional conduct, qualifications, and the quality of services they provide.
              TheraSynced acts solely as a technology platform connecting users with healthcare
              professionals and is not responsible for the quality, safety, or outcomes of any
              healthcare services provided.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Accounts
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.1 Account Registration
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">To use our services, you must:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Be at least 16 years of age (or have parental consent)</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as necessary</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.2 Account Security
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are responsible for maintaining the confidentiality of your account password and
              for all activities that occur under your account. Notify us immediately of any
              unauthorized use.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3.3 Account Termination
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to suspend or terminate your account if you violate these Terms
              or engage in fraudulent, illegal, or harmful activities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Healthcare Professional Requirements
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Healthcare professionals using our platform must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Hold valid professional licenses and certifications</li>
              <li>Maintain professional indemnity insurance (where required)</li>
              <li>Comply with all applicable healthcare regulations and standards</li>
              <li>Provide accurate information about qualifications and services</li>
              <li>Maintain patient confidentiality and comply with data protection laws</li>
              <li>Adhere to professional codes of conduct</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TheraSynced may verify credentials and reserves the right to remove healthcare
              professionals who do not meet these requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Bookings and Appointments
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.1 Booking Process
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">When you book an appointment:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>You enter into a direct agreement with the healthcare professional</li>
              <li>Payment is processed through our secure payment system</li>
              <li>You will receive confirmation and reminders</li>
              <li>Cancellation and refund policies apply as specified</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.2 Cancellations and Refunds
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cancellation policies are set by individual healthcare professionals. Refunds are
              subject to the healthcare professional&apos;s cancellation policy and our refund
              procedures. Late cancellations or no-shows may result in charges as specified.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.3 Rescheduling
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Appointments may be rescheduled subject to availability and the healthcare
              professional&apos;s policies. Rescheduling fees may apply.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Payments
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6.1 Payment Processing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Payments are processed securely through third-party payment processors (e.g., Stripe).
              We do not store your full payment card details. By making a payment, you agree to the
              payment processor&apos;s terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6.2 Pricing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Prices are set by healthcare professionals and displayed on the platform. Prices may
              vary and are subject to change. The price at the time of booking applies.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6.3 Fees
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TheraSynced may charge platform fees. These fees will be clearly disclosed before
              booking. Healthcare professionals may charge additional fees for specific services or
              locations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. User Conduct
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Use the platform for illegal or unauthorized purposes</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with or disrupt the platform</li>
              <li>Attempt to gain unauthorized access to the platform</li>
              <li>Use automated systems to access the platform without permission</li>
              <li>Collect or harvest user information</li>
              <li>Post false, misleading, or defamatory content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The TheraSynced platform, including its design, features, and content, is owned by
              TheraSynced and protected by copyright, trademark, and other intellectual property
              laws.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You retain ownership of content you post, but grant TheraSynced a license to use,
              display, and distribute such content on the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Disclaimers and Limitation of Liability
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              9.1 Service Disclaimer
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TheraSynced is a booking platform. We do not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Provide medical advice, diagnosis, or treatment</li>
              <li>Endorse or guarantee the quality of healthcare professionals</li>
              <li>Verify all information provided by users or healthcare professionals</li>
              <li>Control the services provided by healthcare professionals</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              9.2 Limitation of Liability
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                TheraSynced is not liable for any indirect, incidental, or consequential damages
              </li>
              <li>
                Our total liability is limited to the amount you paid us in the 12 months preceding
                the claim
              </li>
              <li>
                We are not liable for the actions, services, or conduct of healthcare professionals
              </li>
              <li>We do not guarantee uninterrupted or error-free service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              9.3 Medical Disclaimer
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Important:</strong> TheraSynced does not provide medical services. Always seek
              the advice of qualified healthcare providers for medical concerns. In case of medical
              emergencies, contact emergency services immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to indemnify and hold harmless TheraSynced, its officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, and expenses
              (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Your use of the platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Content you post or transmit</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your use of the platform is also governed by our{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              , which explains how we collect, use, and protect your personal data in compliance
              with GDPR and Irish data protection laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Termination
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              12.1 Termination by You
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may terminate your account at any time through your account settings or by
              contacting us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              12.2 Termination by Us
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may suspend or terminate your account immediately if you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activity</li>
              <li>Harm other users or the platform</li>
              <li>Fail to pay fees when due</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              12.3 Effect of Termination
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Upon termination, your right to use the platform ceases immediately. We may delete
              your account and data subject to our Privacy Policy and legal retention requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Dispute Resolution
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.1 Governing Law
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms are governed by the laws of Ireland. Any disputes will be subject to the
              exclusive jurisdiction of Irish courts.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              13.2 Disputes with Healthcare Professionals
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Disputes regarding services provided by healthcare professionals should be resolved
              directly with the healthcare professional. TheraSynced is not a party to such disputes
              but may assist in resolution.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may modify these Terms at any time. Material changes will be notified by email or
              through the platform. Continued use after changes constitutes acceptance. The
              &quot;Last Updated&quot; date indicates when changes were made.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              15. Severability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining
              provisions will continue in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              16. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions about these Terms, contact us:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>TheraSynced</strong>
              <br />
              Email: support@therasynced.com
              <br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

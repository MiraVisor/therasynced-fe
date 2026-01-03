import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TheraSynced Terms of Service - Rules and guidelines for using our platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: 7 days ago</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              TERMS & CONDITIONS (USERS)
            </h2>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              1. Platform Role
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform operates as a neutral marketplace and technical intermediary, providing
              tools for users to discover and communicate with independent therapists. The Platform
              does not provide therapy, medical advice, diagnosis, or treatment, and is not a party
              to any professional or therapeutic relationship between users and therapists.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              2. User Obligations
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Users agree to provide accurate and complete information when registering and using
              the Platform. Users must use the Platform lawfully, respect all applicable
              regulations, and refrain from any actions that could misuse, disrupt, or compromise
              the integrity or security of the Platform or its services.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              3. Communications Disclaimer
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In-platform messaging is provided solely to facilitate communication between users and
              therapists. These communications are intended for convenience and administrative
              purposes only and are not suitable for urgent, emergency, or time-critical situations.
              Users should not rely on in-platform messaging as a substitute for professional advice
              or emergency services.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              4. Emergency & Crisis Disclaimer
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform is not intended for use in medical or mental health emergencies. If a
              user is experiencing an emergency or crisis, they should contact local emergency
              services immediately. The Platform does not monitor messages for clinical risk,
              safeguarding concerns, or emergency indicators, and the Platform assumes no
              responsibility for any consequences arising from users relying on messages for urgent
              situations.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              5. Limitation of Liability
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To the fullest extent permitted by law, the Platform disclaims any liability for
              services provided by therapists, the content of messages exchanged, or any
              interactions between users and therapists. Users acknowledge and accept that all
              therapeutic, medical, or professional services occur solely between the user and the
              therapist.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              6. Eligibility
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform is intended for adults aged 18 years or older. The Platform does not
              knowingly allow access to minors. Therapists are responsible for verifying user
              eligibility where required by professional or regulatory standards.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              7. Governing Law
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms and Conditions are governed by, and construed in accordance with, the laws
              of Ireland. Any disputes arising under or in connection with these Terms shall be
              subject to the exclusive jurisdiction of the courts of Ireland.
            </p>
          </section>

          <section className="mb-8 mt-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              PLATFORM RULES / ACCEPTABLE USE POLICY
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Purpose
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These rules ensure a safe, professional, and lawful platform environment.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Prohibited Conduct
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Users must not:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Misrepresent identity or professional qualifications</li>
              <li>Share unlawful, abusive, or misleading content</li>
              <li>Use the Platform for emergency or crisis support</li>
              <li>Circumvent platform safeguards or security measures</li>
              <li>
                Export or store platform communications in violation of data protection or
                confidentiality obligations
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Enforcement
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Violations may result in suspension or termination of access.
            </p>
          </section>

          <section className="mb-8 mt-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              SUBSCRIPTION & BILLING TERMS (THERAPISTS)
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.1 Subscription Fees
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Therapists pay a recurring subscription fee billed in advance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.2 Refunds
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Except where required by applicable law, subscription fees are non-refundable.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5.3 Non-Payment & Termination
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Failure to pay may result in suspension or termination of access to the Platform.
            </p>
          </section>

          <section className="mb-8 mt-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              THERAPIST AGREEMENT
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Independent Contractor Status
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Therapists act as independent contractors and are not employees, agents, or
              representatives of the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Professional & Regulatory Compliance
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">Therapists warrant that they:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Hold all required licenses, registrations, and permissions</li>
              <li>Maintain appropriate professional indemnity and public liability insurance</li>
              <li>Comply with applicable professional codes of conduct and ethical standards</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Data Protection
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Therapists act as independent Data Controllers for health and therapeutic data. The
              Platform acts as a Data Processor for in-platform communications only.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Breach Notification
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Therapists must notify the Platform without undue delay and, where feasible, within 48
              hours of becoming aware of a personal data breach involving platform data.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Audit & Verification
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform may verify therapist credentials, insurance, and compliance on a
              reasonable basis.
            </p>
          </section>

          <section className="mb-8 mt-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
              DATA PROCESSING ADDENDUM (ANNEX)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This Data Processing Addendum (&quot;DPA&quot;) forms part of the Therapist Agreement
              and governs the processing of personal data by the Platform on behalf of therapists in
              accordance with Article 28 of the General Data Protection Regulation (GDPR).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1. Subject Matter of the Processing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The subject matter of the processing consists of the handling of in-platform
              communications exchanged between users and therapists through the Platform. Such
              communications may include personal data and, where users voluntarily disclose it,
              special category personal data, including health-related information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Duration of the Processing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The processing shall continue for the duration of the Therapist Agreement and for any
              additional period during which the Platform is required to retain data in accordance
              with applicable legal, regulatory, or contractual obligations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3. Nature and Purpose of the Processing
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The nature of the processing includes the secure transmission, storage, and retrieval
              of messages exchanged between users and therapists via the Platform&apos;s messaging
              functionality.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The purpose of the processing is strictly limited to enabling communication between
              users and therapists and ensuring the security, integrity, and availability of the
              Platform. The Platform does not process message content for therapeutic, diagnostic,
              profiling, advertising, or commercial purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              4. Processor Obligations
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform, acting as a data processor, shall:
            </p>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              4.1 Processing on Instructions
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Process personal data only on documented instructions from the therapist, unless
              required to do so by applicable law, in which case the Platform shall inform the
              therapist of such legal requirement unless prohibited from doing so.
            </p>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              4.2 Confidentiality
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ensure that persons authorised to process personal data are bound by appropriate
              confidentiality obligations, whether contractual or statutory, and receive appropriate
              data protection awareness.
            </p>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              4.3 Security Measures
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Implement appropriate technical and organisational measures to ensure a level of
              security appropriate to the risk, including measures to protect against unauthorised
              or unlawful processing, accidental loss, destruction, or damage.
            </p>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              4.4 Data Subject Rights
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Assist therapists, insofar as reasonably possible, in responding to requests from data
              subjects to exercise their rights under the GDPR, taking into account the nature of
              the processing.
            </p>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              4.5 Personal Data Breaches
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Notify the therapist without undue delay after becoming aware of a personal data
              breach involving in-platform communications and provide reasonable information to
              support compliance with breach notification obligations.
            </p>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
              4.6 Deletion or Return of Data
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Upon termination of the Therapist Agreement, delete or return all personal data
              processed on behalf of the therapist, unless retention is required by applicable law,
              in which case such data shall be securely isolated and protected.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              5. Sub-Processors
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform may engage sub-processors for the provision of infrastructure, hosting,
              security, or related services, provided that such sub-processors are engaged under
              written agreements that impose data protection obligations no less protective than
              those set out in this DPA.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform remains responsible for the performance of its sub-processors in
              accordance with GDPR requirements.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              6. Audit and Compliance Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Therapists may request reasonable information necessary to demonstrate the
              Platform&apos;s compliance with this DPA and applicable data protection obligations.
              Any audit or inspection shall be conducted in a manner that minimises disruption to
              the Platform&apos;s operations and protects the confidentiality and security of other
              users and therapists.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              7. Governing Law
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This DPA shall be governed by and construed in accordance with the laws of Ireland.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

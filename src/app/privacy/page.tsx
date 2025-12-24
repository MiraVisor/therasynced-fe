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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: [DATE]</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Who We Are
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TheraSynced (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;) is operated by
              [Legal Entity Name], a company established in Ireland. The Platform is intended for
              use by individuals located in Ireland and provides a digital marketplace that enables
              users to connect with independent therapists.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform provides technical infrastructure only and does not provide healthcare
              services, therapy, medical advice, diagnosis, or treatment of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Roles Under GDPR
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For the purposes of the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                The Platform acts as a Data Controller for account management, subscriptions,
                platform usage, security, and compliance-related processing.
              </li>
              <li>
                The Platform acts as a Data Processor for in-platform communications on behalf of
                therapists.
              </li>
              <li>
                Therapists act as independent Data Controllers for any health, therapeutic, or
                clinical data exchanged with users.
              </li>
              <li>
                The Platform does not determine the purposes or means of any therapeutic or clinical
                processing carried out by therapists. Nothing in this policy creates a joint
                controller relationship.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Personal Data We Process
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We process the following categories of personal data:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Account Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Name, email address, password hash, account role (user or therapist).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Subscription & Billing Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Subscription plan, invoices, payment status. Payments are processed by third-party
              providers; no card details are stored by us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Platform Usage & Security Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Login timestamps, device and browser metadata, IP address, audit logs, fraud
              prevention and abuse detection signals.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              In-Platform Communications
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Messages exchanged between users and therapists via the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Special Category (Health) Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In-platform communications may contain special category personal data, including
              health-related information, where users voluntarily choose to disclose such
              information.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Platform processes such data solely as a data processor on behalf of therapists
              and does not access, analyse, profile, or use message content for therapeutic,
              diagnostic, or commercial purposes.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Legal basis:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Article 9(2)(a) GDPR – Explicit consent</li>
              <li>Article 6(1)(b) GDPR – Performance of a contract</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Consent Mechanics
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Before accessing in-platform messaging, users must provide explicit consent to the
              processing of any health-related data they choose to share. Consent is obtained
              through a clear affirmative action and is recorded with a timestamp and associated
              account identifier.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Users may withdraw consent at any time through account settings. Withdrawal disables
              in-platform messaging but does not affect the lawfulness of processing carried out
              prior to withdrawal and does not prevent users from engaging with therapists outside
              the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Retention
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                Account and billing records are retained for up to 7 years in accordance with Irish
                legal obligations.
              </li>
              <li>
                In-platform communications are retained for 24 months by default, unless a longer
                period is required for dispute resolution or legal compliance.
              </li>
              <li>Platform security and audit logs are retained for up to 24 months.</li>
              <li>
                Retention periods are reviewed periodically to ensure data is not kept longer than
                necessary.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Sharing
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Personal data may be shared with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Therapists (as independent data controllers)</li>
              <li>GDPR-compliant service providers (hosting, security, analytics, payments)</li>
              <li>Regulators or authorities where legally required</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Personal data is not sold, shared for advertising purposes, or used for behavioural
              profiling.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              International Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Where personal data is processed outside the European Economic Area, appropriate
              safeguards such as Standard Contractual Clauses are in place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to access, rectify, erase, restrict, object to processing, request
              data portability, withdraw consent, and lodge a complaint with the Irish Data
              Protection Commission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Privacy queries: [privacy@yourdomain.ie]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

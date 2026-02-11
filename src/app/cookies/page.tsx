import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'TheraSynced Cookie Policy - Information about how we use cookies and similar technologies',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Cookie Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: 7 days ago</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. What Are Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cookies are small text files placed on your device when you access the Platform. They
              are used to enable essential functionality, improve user experience, and allow the
              Platform to operate securely and efficiently.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Cookies We Use
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Strictly Necessary Cookies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies are essential for the operation of the Platform. They enable core
              features such as authentication, security, and maintaining your session across pages.
              Without these cookies, the Platform cannot function properly.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Payment & Fraud Prevention Cookies (Stripe)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our payment processor, Stripe, Inc., sets cookies that are necessary to process
              payments securely, detect and prevent fraud, and comply with financial regulations.
              These cookies are classified as strictly necessary for payment functionality and
              cannot be disabled when using payment features. Stripe may also use cookies for its
              own fraud detection and analytics purposes as an independent data controller. For
              details, see{' '}
              <a
                href="https://stripe.com/cookies-policy/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Stripe&apos;s Cookie Policy
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Functional Cookies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Functional cookies store user preferences, such as display settings or language
              selection, to provide a more personalised and convenient experience on the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              Analytics Cookies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Analytics cookies are used to collect information about how users interact with the
              Platform in an aggregated and anonymised form. This helps us understand platform
              usage, measure performance, and identify areas for improvement. Analytics cookies do
              not involve behavioural advertising or cross-site tracking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Consent
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Non-essential cookies, including functional and analytics cookies, are only used if
              the user provides explicit opt-in consent via the cookie banner. Users may review,
              adjust, or withdraw their consent at any time through account settings or browser
              controls.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

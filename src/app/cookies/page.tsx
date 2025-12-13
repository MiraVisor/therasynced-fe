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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last Updated: January 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cookies are small text files that are placed on your device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to
              website owners.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This Cookie Policy explains how TheraSynced uses cookies and similar technologies when
              you visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Types of Cookies We Use
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1. Essential Cookies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies are necessary for the website to function and cannot be switched off.
              They are usually set in response to actions you take, such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Logging into your account</li>
              <li>Setting your privacy preferences</li>
              <li>Filling in forms</li>
              <li>Security and authentication</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Legal Basis:</strong> These cookies are essential for the performance of our
              contract with you (GDPR Article 6(1)(b)).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Analytics Cookies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies help us understand how visitors interact with our website by collecting
              and reporting information anonymously. This helps us improve our services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Examples:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Google Analytics (if enabled)</li>
              <li>Page view tracking</li>
              <li>User behavior analysis</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Legal Basis:</strong> Your consent (GDPR Article 6(1)(a)). You can withdraw
              consent at any time.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3. Marketing Cookies
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies are used to deliver personalized advertisements and track campaign
              performance. They may be set by third-party advertising partners.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Legal Basis:</strong> Your consent (GDPR Article 6(1)(a)). You can withdraw
              consent at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Specific Cookies We Use
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b">
                      Cookie Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b">
                      Purpose
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">token</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Authentication and session management
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Essential
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">7 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      cookie-consent
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Stores your cookie consent preferences
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Essential
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      cookie-preferences
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Stores your specific cookie category preferences
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      Essential
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can manage your cookie preferences at any time:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Cookie Banner:</strong> When you first visit our site, you&apos;ll see a
                cookie consent banner where you can accept all, reject all, or customize your
                preferences.
              </li>
              <li>
                <strong>Settings:</strong> You can change your preferences at any time by clicking
                the cookie settings link in the footer.
              </li>
              <li>
                <strong>Browser Settings:</strong> Most browsers allow you to control cookies
                through their settings. However, disabling essential cookies may affect website
                functionality.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Some cookies are placed by third-party services that appear on our pages. We do not
              control these cookies. Third-party cookies may include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                <strong>Payment Processors:</strong> Stripe may set cookies for payment processing
              </li>
              <li>
                <strong>Analytics Services:</strong> Google Analytics (if enabled) may set cookies
                for analytics
              </li>
              <li>
                <strong>Cloud Storage:</strong> Cloudinary may set cookies for image delivery
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Please refer to these third parties&apos; privacy policies for information about their
              cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Under GDPR, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
              <li>Withdraw consent for non-essential cookies at any time</li>
              <li>Access information about cookies we use</li>
              <li>Request deletion of cookie data</li>
              <li>Object to processing of cookie data for analytics or marketing</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For more information about your data protection rights, see our{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any material
              changes by updating the &quot;Last Updated&quot; date. We encourage you to review this
              policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about our use of cookies, contact us:
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

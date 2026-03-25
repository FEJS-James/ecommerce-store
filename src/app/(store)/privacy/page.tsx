import type { Metadata } from "next";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "AI Armory privacy policy. How we collect, use, and protect your data under UK GDPR and the Data Protection Act 2018.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Home
      </Link>

      <div className="glass rounded-2xl p-8 sm:p-12">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: March 2026 &middot; Version 1.0
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Data Controller
            </h2>
            <p className="text-zinc-400">
              AI Armory is the data controller responsible for your personal
              data. This privacy policy applies to data collected through our
              website at aiarmory.shop and is compliant with the UK General Data
              Protection Regulation (UK GDPR), the Data Protection Act 2018, and
              the Privacy and Electronic Communications Regulations (PECR).
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Data We Collect
            </h2>
            <p className="text-zinc-400 mb-4">
              We collect the following categories of personal data:
            </p>

            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              2.1 Account Data
            </h3>
            <p className="text-zinc-400 mb-4">
              When you create an account: your name and email address.
            </p>

            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              2.2 Purchase Data
            </h3>
            <p className="text-zinc-400 mb-4">
              When you make a purchase: products purchased, transaction amounts,
              order history, and billing information (excluding payment card
              details, which are processed directly by our payment providers).
            </p>

            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              2.3 Usage Data
            </h3>
            <p className="text-zinc-400 mb-4">
              When you visit the Site: anonymised analytics data including pages
              visited, time spent on pages, browser type, device type, and
              referring URLs. This data is collected only with your consent.
            </p>

            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              2.4 Newsletter Data
            </h3>
            <p className="text-zinc-400">
              If you subscribe to our newsletter: your email address.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Legal Basis for Processing
            </h2>
            <p className="text-zinc-400 mb-4">
              We process your personal data on the following legal grounds:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">
                  Performance of a contract
                </strong>{" "}
                &mdash; Processing account and purchase data is necessary to
                fulfil your order and provide access to purchased products.
              </li>
              <li>
                <strong className="text-zinc-200">Legitimate interests</strong>{" "}
                &mdash; We use anonymised analytics data to improve the Site,
                understand usage patterns, and enhance user experience. We have
                assessed that this processing does not override your rights and
                freedoms.
              </li>
              <li>
                <strong className="text-zinc-200">Consent</strong> &mdash;
                Newsletter subscriptions are based on your explicit opt-in
                consent. You can withdraw this consent at any time by
                unsubscribing.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Payment Processing
            </h2>
            <p className="text-zinc-400">
              We do <strong className="text-zinc-200">not</strong> store,
              process, or have access to your payment card details. All payments
              are processed securely by our third-party payment providers:{" "}
              <strong className="text-zinc-200">Stripe</strong> and{" "}
              <strong className="text-zinc-200">PayPal</strong>. These providers
              are PCI DSS compliant and handle all card data directly. Please
              refer to their respective privacy policies for information on how
              they process your payment data.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Data Sharing
            </h2>
            <p className="text-zinc-400 mb-4">
              We share your personal data only with the following third parties,
              and only to the extent necessary to operate the Site and fulfil
              orders:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Stripe</strong> &mdash;
                Payment processing.
              </li>
              <li>
                <strong className="text-zinc-200">PayPal</strong> &mdash;
                Payment processing.
              </li>
              <li>
                <strong className="text-zinc-200">Vercel</strong> &mdash;
                Website hosting and infrastructure.
              </li>
            </ul>
            <p className="text-zinc-400 mt-4">
              We do <strong className="text-zinc-200">not</strong> sell, rent,
              or trade your personal data to any third party for marketing or
              any other purpose.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. Data Retention
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">
                  Account and purchase data
                </strong>{" "}
                &mdash; Retained for 6 years after your last transaction, as
                required by UK tax law (HMRC record-keeping obligations).
              </li>
              <li>
                <strong className="text-zinc-200">Newsletter data</strong>{" "}
                &mdash; Retained until you unsubscribe. Upon unsubscription,
                your email is deleted from our mailing list within 30 days.
              </li>
              <li>
                <strong className="text-zinc-200">Analytics data</strong>{" "}
                &mdash; Anonymised and retained for a maximum of 26 months,
                after which it is automatically deleted.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. Your Rights Under UK GDPR
            </h2>
            <p className="text-zinc-400 mb-4">
              Under the UK GDPR and Data Protection Act 2018, you have the
              following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Right of access</strong>{" "}
                &mdash; You can request a copy of the personal data we hold
                about you.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Right to rectification
                </strong>{" "}
                &mdash; You can request that we correct any inaccurate or
                incomplete data.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Right to erasure (&ldquo;right to be forgotten&rdquo;)
                </strong>{" "}
                &mdash; You can request deletion of your personal data, subject
                to our legal retention obligations.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Right to restrict processing
                </strong>{" "}
                &mdash; You can request that we limit how we use your data.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Right to data portability
                </strong>{" "}
                &mdash; You can request your data in a structured,
                commonly-used, machine-readable format.
              </li>
              <li>
                <strong className="text-zinc-200">Right to object</strong>{" "}
                &mdash; You can object to processing based on legitimate
                interests.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Right to withdraw consent
                </strong>{" "}
                &mdash; Where processing is based on consent, you can withdraw
                it at any time without affecting the lawfulness of prior
                processing.
              </li>
            </ul>
            <p className="text-zinc-400 mt-4">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:support@aiarmory.shop"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                support@aiarmory.shop
              </a>
              . We will respond within one month of receiving your request.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. International Data Transfers
            </h2>
            <p className="text-zinc-400">
              Some of our service providers (Vercel, Stripe) are based in the
              United States. Where personal data is transferred outside the
              United Kingdom, we ensure appropriate safeguards are in place,
              including Standard Contractual Clauses (SCCs) approved by the
              Information Commissioner&apos;s Office (ICO), to protect your data
              to the same standard as required under UK GDPR.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              9. Children
            </h2>
            <p className="text-zinc-400">
              Our Site and services are not directed at individuals under the
              age of 18. We do not knowingly collect personal data from
              children. If we become aware that we have collected personal data
              from a person under 18, we will take steps to delete that data
              promptly.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              10. Cookies
            </h2>
            <p className="text-zinc-400">
              For detailed information about how we use cookies, please see our{" "}
              <Link
                href="/cookies"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              11. Complaints
            </h2>
            <p className="text-zinc-400 mb-3">
              If you are unhappy with how we have handled your personal data,
              you have the right to lodge a complaint with the Information
              Commissioner&apos;s Office (ICO):
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                Website:{" "}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  ico.org.uk
                </a>
              </li>
              <li>Telephone: 0303 123 1113</li>
            </ul>
            <p className="text-zinc-400 mt-3">
              We encourage you to contact us first at{" "}
              <a
                href="mailto:support@aiarmory.shop"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                support@aiarmory.shop
              </a>{" "}
              so we have the opportunity to resolve any concerns directly.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              12. Changes to This Policy
            </h2>
            <p className="text-zinc-400">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated &ldquo;Last
              updated&rdquo; date. We encourage you to review this policy
              periodically.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              13. Contact
            </h2>
            <p className="text-zinc-400">
              For any questions about this Privacy Policy or your personal data,
              please contact us at:
            </p>
            <p className="text-zinc-400 mt-3">
              <strong className="text-zinc-200">Email:</strong>{" "}
              <a
                href="mailto:support@aiarmory.shop"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                support@aiarmory.shop
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

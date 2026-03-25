import type { Metadata } from "next";
import { Cookie, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "AI Armory cookie policy. How we use cookies and similar technologies, compliant with PECR.",
};

export default function CookiesPage() {
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
          <Cookie className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
        </div>
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: March 2026 &middot; Version 1.0
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. What Are Cookies
            </h2>
            <p className="text-zinc-400">
              Cookies are small text files that are placed on your device when
              you visit a website. They are widely used to make websites work
              more efficiently, provide a better user experience, and supply
              information to site owners. This Cookie Policy is compliant with
              the Privacy and Electronic Communications Regulations (PECR).
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Essential Cookies
            </h2>
            <p className="text-zinc-400 mb-4">
              These cookies are strictly necessary for the Site to function.
              They do not require your consent under PECR. Without these
              cookies, core features such as user authentication and shopping
              functionality would not work.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Cookie Name
                    </th>
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Purpose
                    </th>
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Expiry
                    </th>
                    <th className="py-3 text-zinc-300 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4 font-mono text-xs">
                      session_token
                    </td>
                    <td className="py-3 pr-4">Maintains your login session</td>
                    <td className="py-3 pr-4">7 days</td>
                    <td className="py-3">Essential</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4 font-mono text-xs">admin_token</td>
                    <td className="py-3 pr-4">
                      Maintains admin authentication
                    </td>
                    <td className="py-3 pr-4">24 hours</td>
                    <td className="py-3">Essential</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4 font-mono text-xs">
                      cookie_consent
                    </td>
                    <td className="py-3 pr-4">Stores your cookie preference</td>
                    <td className="py-3 pr-4">1 year</td>
                    <td className="py-3">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Analytics Cookies
            </h2>
            <p className="text-zinc-400 mb-4">
              These cookies help us understand how visitors interact with the
              Site by collecting anonymised usage data. Analytics cookies are
              only set if you have given your consent via the cookie banner.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Cookie Name
                    </th>
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Purpose
                    </th>
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Expiry
                    </th>
                    <th className="py-3 text-zinc-300 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4 font-mono text-xs">cf_beacon</td>
                    <td className="py-3 pr-4">
                      Cloudflare Web Analytics &mdash; tracks page views and
                      performance metrics anonymously
                    </td>
                    <td className="py-3 pr-4">Session</td>
                    <td className="py-3">Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-sm mt-3">
              We use Cloudflare Web Analytics, which is a privacy-first
              analytics tool that does not use client-side state and does not
              track individuals across sites. It collects aggregated,
              non-personally-identifiable data.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Payment Cookies
            </h2>
            <p className="text-zinc-400 mb-4">
              When you initiate a payment, our payment providers may set cookies
              necessary to process your transaction securely.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Provider
                    </th>
                    <th className="py-3 pr-4 text-zinc-300 font-semibold">
                      Purpose
                    </th>
                    <th className="py-3 text-zinc-300 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4">Stripe</td>
                    <td className="py-3 pr-4">
                      Fraud prevention, payment processing, and session
                      management during checkout
                    </td>
                    <td className="py-3">Essential (payment)</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="py-3 pr-4">PayPal</td>
                    <td className="py-3 pr-4">
                      Authentication, fraud prevention, and payment processing
                    </td>
                    <td className="py-3">Essential (payment)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-sm mt-3">
              These cookies are set by Stripe and PayPal directly and are
              governed by their respective cookie and privacy policies.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Advertising Cookies
            </h2>
            <p className="text-zinc-400">
              We do <strong className="text-zinc-200">not</strong> use any
              advertising or tracking cookies. We do not serve targeted
              advertisements, and we do not share data with advertising
              networks.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. Managing Cookies
            </h2>
            <p className="text-zinc-400 mb-3">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Cookie banner:</strong> When
                you first visit the Site, you can choose to accept all cookies
                or only essential cookies.
              </li>
              <li>
                <strong className="text-zinc-200">Browser settings:</strong>{" "}
                Most web browsers allow you to control cookies through their
                settings. You can set your browser to refuse all cookies or to
                indicate when a cookie is being sent.
              </li>
              <li>
                <strong className="text-zinc-200">Clearing cookies:</strong> You
                can delete all cookies stored on your device through your
                browser settings at any time.
              </li>
            </ul>
            <p className="text-zinc-400 mt-3">
              Please note that blocking essential cookies may prevent the Site
              from functioning correctly (for example, you may not be able to
              log in or complete a purchase).
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. Changes to This Policy
            </h2>
            <p className="text-zinc-400">
              We may update this Cookie Policy from time to time. Any changes
              will be posted on this page with an updated &ldquo;Last
              updated&rdquo; date.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. Contact
            </h2>
            <p className="text-zinc-400">
              For any questions about this Cookie Policy, please contact us at:
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

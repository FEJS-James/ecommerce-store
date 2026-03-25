import type { Metadata } from "next";
import { Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using AI Armory products and services. Governed by the laws of England and Wales.",
};

export default function TermsPage() {
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
          <Scale className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-white">
            Terms &amp; Conditions
          </h1>
        </div>
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: March 2026 &middot; Version 1.0
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Definitions
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">
                  &ldquo;We&rdquo;, &ldquo;Us&rdquo;, &ldquo;Our&rdquo;
                </strong>{" "}
                &mdash; AI Armory, operating at aiarmory.shop.
              </li>
              <li>
                <strong className="text-zinc-200">
                  &ldquo;Customer&rdquo;, &ldquo;You&rdquo;,
                  &ldquo;Your&rdquo;
                </strong>{" "}
                &mdash; any individual or entity that purchases products or
                services from us.
              </li>
              <li>
                <strong className="text-zinc-200">
                  &ldquo;Digital Product&rdquo;
                </strong>{" "}
                &mdash; any downloadable digital file, template, prompt pack, or
                other digital content sold through our store.
              </li>
              <li>
                <strong className="text-zinc-200">&ldquo;Service&rdquo;</strong>{" "}
                &mdash; any consultation, development, or professional service
                engagement offered by AI Armory.
              </li>
              <li>
                <strong className="text-zinc-200">&ldquo;Site&rdquo;</strong>{" "}
                &mdash; the website located at aiarmory.shop, including all
                pages, content, and functionality.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Acceptance of Terms
            </h2>
            <p className="text-zinc-400">
              By accessing or using the Site, creating an account, or making a
              purchase, you agree to be bound by these Terms &amp; Conditions.
              If you do not agree with any part of these terms, you must not use
              the Site or purchase any products or services. These terms
              constitute a legally binding agreement between you and AI Armory.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Eligibility
            </h2>
            <p className="text-zinc-400">
              You must be at least 18 years of age to use the Site or purchase
              any products or services. By using the Site, you represent and
              warrant that you are at least 18 years old and have the legal
              capacity to enter into a binding contract.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-zinc-400 mb-3">
              All content on the Site, including but not limited to text,
              graphics, logos, images, software, digital products, templates,
              prompt packs, and code, is the property of AI Armory or its
              licensors and is protected by United Kingdom and international
              copyright, trademark, and intellectual property laws.
            </p>
            <p className="text-zinc-400">
              You may not reproduce, distribute, modify, create derivative works
              of, publicly display, publicly perform, republish, download, store,
              or transmit any material from the Site except as expressly
              permitted under the licence granted upon purchase (see Section 5).
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Product Licence
            </h2>
            <p className="text-zinc-400 mb-3">
              Upon purchasing a Digital Product, you are granted a{" "}
              <strong className="text-zinc-200">
                single-user, non-exclusive, non-transferable licence
              </strong>{" "}
              to use the product for your personal or commercial purposes,
              subject to the following restrictions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                You <strong className="text-zinc-200">may</strong> use the
                product and any outputs generated from it for personal and
                commercial purposes.
              </li>
              <li>
                You <strong className="text-zinc-200">may not</strong> resell,
                redistribute, sublicence, share, or make the product files
                available to any third party.
              </li>
              <li>
                You <strong className="text-zinc-200">may not</strong> claim
                ownership of the original product files or present them as your
                own creation.
              </li>
              <li>
                The licence is for a single user only. Each additional user
                requires a separate purchase.
              </li>
              <li>
                We reserve the right to revoke the licence if these terms are
                breached.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. Service Terms
            </h2>
            <p className="text-zinc-400 mb-3">
              Our consultation and development services are provided as one-time
              engagements unless otherwise agreed in writing. The scope of each
              engagement will be defined prior to commencement.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                AI Armory is not liable for the ongoing operation, maintenance,
                or support of any deliverables after handover unless a separate
                maintenance agreement is in place.
              </li>
              <li>
                Any deadlines provided are estimates and not guarantees. We will
                make reasonable efforts to deliver within the agreed timeframe.
              </li>
              <li>
                You are responsible for providing accurate information and timely
                feedback to facilitate service delivery.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. AI Content Disclaimer
            </h2>
            <p className="text-zinc-400 mb-3">
              Some of our products and services involve artificial intelligence
              and machine learning technologies. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                AI-generated outputs are probabilistic in nature and are not
                guaranteed to be accurate, complete, or fit for any particular
                purpose.
              </li>
              <li>
                You are solely responsible for reviewing, verifying, and
                validating all AI-generated content before use in any context,
                including but not limited to commercial, legal, medical, or
                financial applications.
              </li>
              <li>
                AI Armory makes no warranty, express or implied, regarding the
                accuracy, reliability, or suitability of AI-generated outputs.
              </li>
              <li>
                You assume all risk associated with the use of AI-generated
                content.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-zinc-400 mb-3">
              To the fullest extent permitted by applicable law:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                Our total liability to you for any claim arising out of or
                relating to your purchase or use of our products or services
                shall not exceed the{" "}
                <strong className="text-zinc-200">
                  total amount you paid for the specific product or service
                </strong>{" "}
                giving rise to the claim.
              </li>
              <li>
                We shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including but not limited to
                loss of profits, data, business, or goodwill.
              </li>
              <li>
                Nothing in these terms excludes or limits our liability for death
                or personal injury caused by our negligence, fraud, or any other
                liability that cannot be excluded by law.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              9. Third-Party Services
            </h2>
            <p className="text-zinc-400 mb-3">
              Some of our products may require the use of third-party services,
              APIs, or platforms (including but not limited to OpenAI, Anthropic,
              Google, and other AI providers).
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                You are solely responsible for any costs, fees, or charges
                incurred through your use of third-party services, including API
                usage costs.
              </li>
              <li>
                AI Armory is not responsible for the availability, performance,
                or terms of service of any third-party platform.
              </li>
              <li>
                Your use of third-party services is subject to the respective
                terms and privacy policies of those providers.
              </li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              10. Modification of Terms
            </h2>
            <p className="text-zinc-400">
              We reserve the right to modify these Terms &amp; Conditions at any
              time. Changes will be effective immediately upon posting to the
              Site. The &ldquo;Last updated&rdquo; date at the top of this page
              will be revised accordingly. Your continued use of the Site after
              any changes constitutes acceptance of the modified terms. We
              encourage you to review these terms periodically.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              11. Severability
            </h2>
            <p className="text-zinc-400">
              If any provision of these Terms &amp; Conditions is found to be
              invalid, illegal, or unenforceable by a court of competent
              jurisdiction, the remaining provisions shall continue in full force
              and effect. The invalid provision shall be modified to the minimum
              extent necessary to make it valid and enforceable.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              12. Governing Law &amp; Jurisdiction
            </h2>
            <p className="text-zinc-400">
              These Terms &amp; Conditions are governed by and construed in
              accordance with the laws of England and Wales. Any disputes arising
              out of or in connection with these terms shall be subject to the
              exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              13. Contact Information
            </h2>
            <p className="text-zinc-400">
              If you have any questions about these Terms &amp; Conditions,
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

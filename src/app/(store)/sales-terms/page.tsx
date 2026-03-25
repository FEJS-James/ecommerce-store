import type { Metadata } from "next";
import { Receipt, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sales Terms & Refund Policy",
  description:
    "Sales terms, refund policy, and delivery information for AI Armory. Consumer Rights Act 2015 compliant.",
};

export default function SalesTermsPage() {
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
          <Receipt className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-white">
            Sales Terms &amp; Refund Policy
          </h1>
        </div>
        <p className="text-zinc-500 text-sm mb-10">
          Last updated: March 2026 &middot; Version 1.0
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              1. Digital Products &mdash; Cancellation &amp; Refunds
            </h2>
            <p className="text-zinc-400 mb-3">
              Under the Consumer Contracts (Information, Cancellation and
              Additional Charges) Regulations 2013 and the Consumer Rights Act
              2015, digital content purchases are subject to the following
              terms:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                Before completing your purchase, you will be asked to provide
                explicit consent to begin immediate access to the digital
                content and to acknowledge that you lose your 14-day right to
                cancel once the download begins.
              </li>
              <li>
                Once you have provided this consent and the download has
                commenced, all sales of digital products are{" "}
                <strong className="text-zinc-200">final</strong>.
              </li>
              <li>
                This is in accordance with Regulation 37 of the Consumer
                Contracts Regulations 2013, which provides that the right to
                cancel does not apply to the supply of digital content which is
                not supplied on a tangible medium if the performance has begun
                with your prior express consent and acknowledgement.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              2. Voluntary Money-Back Guarantee
            </h2>
            <p className="text-zinc-400 mb-3">
              As a goodwill gesture (and not a legal obligation), we offer a
              voluntary{" "}
              <strong className="text-zinc-200">
                30-day money-back guarantee
              </strong>{" "}
              for digital products that are defective or materially not as
              described on the product page. To qualify for a refund under this
              guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                You must contact us within 30 days of purchase at{" "}
                <a
                  href="mailto:support@aiarmory.shop"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  support@aiarmory.shop
                </a>
                .
              </li>
              <li>
                You must describe the defect or how the product does not match
                its description.
              </li>
              <li>
                You must not have used the product commercially prior to
                requesting a refund.
              </li>
              <li>
                Upon approval of a refund, your download access will be revoked.
              </li>
            </ul>
            <p className="text-zinc-400 mt-3">
              We reserve the right to refuse a refund if the above conditions
              are not met or if we reasonably determine that the product is not
              defective and matches its description.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              3. Service Engagements
            </h2>
            <p className="text-zinc-400 mb-3">
              For consultation and development services (Tier 3 and Tier 4
              offerings):
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                A <strong className="text-zinc-200">50% deposit</strong> is
                required to commence work. The remaining balance is due upon
                delivery.
              </li>
              <li>
                <strong className="text-zinc-200">Cancellation:</strong> You may
                cancel a service engagement at any time before delivery begins.
                If work has not commenced, the deposit will be refunded in full.
                If work has commenced, a partial refund may be provided at our
                discretion, proportionate to work not yet completed.
              </li>
              <li>
                <strong className="text-zinc-200">After delivery:</strong> No
                refunds are available once the service deliverables have been
                handed over and accepted.
              </li>
              <li>
                If you are dissatisfied with the delivered work, please contact
                us within 14 days of delivery and we will make reasonable
                efforts to address your concerns.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              4. Pricing &amp; Currency
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                Digital product prices are displayed in{" "}
                <strong className="text-zinc-200">USD</strong> by default, with
                regional pricing available based on your location.
              </li>
              <li>
                Service prices are quoted in{" "}
                <strong className="text-zinc-200">USD</strong>.
              </li>
              <li>
                All prices are inclusive of VAT where applicable (see Section
                7).
              </li>
              <li>
                We reserve the right to change prices at any time. Price changes
                do not affect orders already placed.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              5. Delivery
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Digital products:</strong>{" "}
                Delivered instantly via download link after successful payment.
                You will also receive an email confirmation with download
                instructions.
              </li>
              <li>
                <strong className="text-zinc-200">Services:</strong> Typical
                delivery timeframe is 5 to 10 business days from the date the
                deposit is received and the project scope is confirmed. Exact
                timelines will be agreed upon before work begins.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              6. Payment Methods
            </h2>
            <p className="text-zinc-400 mb-3">
              We accept the following payment methods:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Stripe</strong> &mdash; Credit
                and debit cards (Visa, Mastercard, American Express, and
                others).
              </li>
              <li>
                <strong className="text-zinc-200">PayPal</strong> &mdash; PayPal
                balance, linked bank account, or card through PayPal.
              </li>
              <li>
                <strong className="text-zinc-200">Bitcoin</strong> &mdash;
                Available in a future update (when available, accepted via
                Lightning Network or on-chain).
              </li>
            </ul>
            <p className="text-zinc-400 mt-3">
              All payment processing is handled securely by our payment
              providers. We never store your payment card details.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              7. VAT &amp; Tax
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">United Kingdom:</strong> VAT
                is included in the displayed price.
              </li>
              <li>
                <strong className="text-zinc-200">European Union:</strong> VAT
                is charged based on your location, in accordance with EU VAT
                rules for digital services.
              </li>
              <li>
                <strong className="text-zinc-200">Rest of world:</strong> No UK
                VAT is charged. You may be responsible for local taxes or import
                duties in your jurisdiction.
              </li>
              <li>
                VAT calculation and collection is handled automatically by{" "}
                <strong className="text-zinc-200">Stripe Tax</strong>.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              8. Dispute Resolution
            </h2>
            <p className="text-zinc-400 mb-3">
              If you have a complaint or dispute regarding a purchase:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Step 1:</strong> Contact us at{" "}
                <a
                  href="mailto:support@aiarmory.shop"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  support@aiarmory.shop
                </a>{" "}
                and we will aim to resolve the issue within 14 days.
              </li>
              <li>
                <strong className="text-zinc-200">Step 2:</strong> If we cannot
                resolve the matter directly, you may refer the dispute to an
                approved UK Alternative Dispute Resolution (ADR) provider.
              </li>
              <li>
                You also have the right to take legal action through the courts
                of England and Wales.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              9. Your Statutory Rights
            </h2>
            <p className="text-zinc-400">
              Nothing in these Sales Terms affects your statutory rights under
              the Consumer Rights Act 2015. Digital content must be of
              satisfactory quality, fit for a particular purpose, and as
              described. If digital content is faulty, you have the right to a
              repair or replacement and, if the fault cannot be fixed, a refund.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              10. Contact
            </h2>
            <p className="text-zinc-400">
              For any questions about these Sales Terms or to request a refund,
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

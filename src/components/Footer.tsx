import Link from "next/link";
import { Zap, Lock, ShieldCheck, Shield } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/[0.06] mt-auto"
      style={{ background: "#07070B" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex mb-4"
            >
              <Logo size={28} variant="full" colorVariant="gradient" />
            </Link>
            <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
              Your arsenal of AI-powered digital products for creators,
              developers, and professionals. Instant delivery. Lifetime access.
              No subscriptions.
            </p>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Products
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/products?category=prompt-packs"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  AI Prompt Packs
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=finance-templates"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Finance Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=dev-templates"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Dev Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=notion-templates"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Notion Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/support#faq"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/support#contact"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/support#request"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Submit Request
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/terms"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/sales-terms"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Sales Terms &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} AI Armory. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              Instant Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <Lock
                className="w-3.5 h-3.5 text-indigo-400"
                aria-hidden="true"
              />
              Lifetime Access
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-indigo-400"
                aria-hidden="true"
              />
              30-Day Guarantee
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

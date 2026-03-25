import Link from "next/link";
import { Shield, Zap, Lock, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/[0.06] mt-auto"
      style={{ background: "#07070B" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-xl text-white mb-4"
            >
              <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />
              <span>AI Armory</span>
            </Link>
            <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
              Ready-to-deploy AI automation for businesses. Blueprints, agent
              configs, and expert setup services.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Products
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/products?category=automation-blueprints"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Automation Blueprints
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=agent-configs"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Agent Configurations
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=prompt-packs"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Prompt Engineering
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/services"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Strategy Session
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Done-For-You Setup
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Enterprise Solutions
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
                  href="/free"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  Free Downloads
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm"
                >
                  My Account
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

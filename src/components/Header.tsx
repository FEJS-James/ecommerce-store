"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, LogIn } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/account/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const accountHref = isLoggedIn ? "/account" : "/account/login";
  const accountLabel = isLoggedIn ? "Account" : "Login";
  const AccountIcon = isLoggedIn ? User : LogIn;

  return (
    <header className="glass !rounded-none !border-x-0 !border-t-0 !bg-[rgba(10,10,15,0.8)] sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center group">
            <span className="hidden sm:inline-flex">
              <Logo size={28} variant="full" colorVariant="gradient" />
            </span>
            <span className="sm:hidden">
              <Logo size={28} variant="icon" colorVariant="gradient" />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Products
            </Link>
            <Link
              href="/openclaw"
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              OpenClaw
            </Link>
            <Link
              href="/services"
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Services
            </Link>
            <Link
              href="/support"
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Support
            </Link>
            <Link
              href={accountHref}
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <AccountIcon className="w-4 h-4" aria-hidden="true" />
              {accountLabel}
            </Link>
          </div>

          {/* Mobile menu button */}
          {mounted && (
            <button
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors focus-glow"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile slide-out panel */}
      {mounted && mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            id="mobile-nav-panel"
            className="fixed top-0 right-0 h-full w-72 z-50 md:hidden glass !rounded-none border-l border-white/[0.08] p-6 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between mb-8">
              <Logo size={24} variant="full" colorVariant="gradient" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors focus-glow"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href="/products"
                className="text-zinc-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/openclaw"
                className="text-zinc-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                OpenClaw
              </Link>
              <Link
                href="/services"
                className="text-zinc-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/support"
                className="text-zinc-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                href={accountHref}
                className="text-zinc-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/[0.05] transition-colors font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <AccountIcon className="w-4 h-4" aria-hidden="true" />
                {accountLabel}
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

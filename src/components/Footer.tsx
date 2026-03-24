import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <span className="text-2xl">🛡️</span>
              <span>AI Armory</span>
            </Link>
            <p className="text-gray-400 max-w-md">
              Your arsenal of AI-powered digital products for creators, developers, and professionals.
              Instant delivery. Lifetime access. No subscriptions.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=prompt-packs" className="hover:text-white transition-colors">AI Prompt Packs</Link></li>
              <li><Link href="/products?category=finance-templates" className="hover:text-white transition-colors">Finance Templates</Link></li>
              <li><Link href="/products?category=dev-templates" className="hover:text-white transition-colors">Dev Templates</Link></li>
              <li><Link href="/products?category=notion-templates" className="hover:text-white transition-colors">Notion Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/free" className="hover:text-white transition-colors">Free Downloads</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} AI Armory. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm">
            <span>Instant Delivery ⚡</span>
            <span>Lifetime Access 🔒</span>
            <span>30-Day Guarantee ✅</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

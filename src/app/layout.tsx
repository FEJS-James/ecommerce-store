import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} -- Your Arsenal of AI-Powered Digital Products`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} -- Your Arsenal of AI-Powered Digital Products`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} -- Your Arsenal of AI-Powered Digital Products`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} antialiased`}>
        {children}
        <Script
          defer
          src="https://umami-seven-tau.vercel.app/script.js"
          data-website-id="a4fedac4-73eb-4f8a-bdb9-1e7b2bcb92bb"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

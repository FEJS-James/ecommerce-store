import { NextRequest, NextResponse } from "next/server";
import { getTierForCountry } from "@/lib/pricing";

export function middleware(request: NextRequest) {
  const countryCode = request.headers.get("x-vercel-ip-country");
  const tierInfo = getTierForCountry(countryCode);

  const response = NextResponse.next();

  // Set headers for server components
  response.headers.set("x-pricing-tier", String(tierInfo.tier));
  response.headers.set("x-currency", tierInfo.currency);
  response.headers.set("x-discount-pct", String(tierInfo.discountPct));

  // Set cookies for client components
  response.cookies.set("x-pricing-tier", String(tierInfo.tier), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  response.cookies.set("x-currency", tierInfo.currency, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  response.cookies.set("x-discount-pct", String(tierInfo.discountPct), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

import { NextResponse } from "next/server";

/**
 * Returns the PayPal client ID at runtime (server-side).
 *
 * NEXT_PUBLIC_* env vars are inlined at build time in client code,
 * so if the var is added after a Vercel deploy, the client bundle
 * will not contain it. This endpoint reads the env var at request
 * time, making it available regardless of when it was set.
 */
export function GET() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  return NextResponse.json(
    { clientId: clientId || null },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}

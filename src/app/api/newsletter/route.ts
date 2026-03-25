import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const source = typeof body.source === "string" ? body.source : "website";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    const existing = await queryOne<{
      id: string;
      status: string;
      unsubscribed_at: string | null;
    }>(
      "SELECT id, status, unsubscribed_at FROM email_subscribers WHERE email = ?",
      [email],
    );

    if (existing) {
      if (existing.status === "unsubscribed" || existing.unsubscribed_at) {
        await execute(
          `UPDATE email_subscribers
           SET status = 'active', unsubscribed_at = NULL,
               subscribed_at = datetime('now'), source = ?,
               name = COALESCE(?, name)
           WHERE id = ?`,
          [source, name, existing.id],
        );
        return NextResponse.json({
          success: true,
          message: "Welcome back! You have been re-subscribed.",
        });
      }
      return NextResponse.json({
        success: true,
        message: "You are already subscribed.",
      });
    }

    const id = crypto.randomUUID().replace(/-/g, "");
    await execute(
      `INSERT INTO email_subscribers (id, email, name, source, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [id, email, name || null, source],
    );

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 },
    );
  }
}

import { Resend } from "resend";
import { execute } from "@/lib/db";

const EMAIL_FROM = process.env.EMAIL_FROM || "support@aiarmory.shop";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY is not set. Emails will not be sent.");
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  const resend = getResend();

  let result: { success: boolean; id?: string; error?: string };

  if (!resend) {
    console.warn(`[Email] Skipped (no API key): "${subject}" to ${to}`);
    result = { success: false, error: "RESEND_API_KEY not configured" };
  } else {
    try {
      const response = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (response.error) {
        console.error("[Email] Resend error:", response.error);
        result = {
          success: false,
          error: response.error.message || "Unknown Resend error",
        };
      } else {
        result = { success: true, id: response.data?.id };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Email] Send failed:", message);
      result = { success: false, error: message };
    }
  }

  // Log to email_history table (best-effort, never throw)
  try {
    await execute(
      `INSERT INTO email_history (id, recipient, subject, status, resend_id, error, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        crypto.randomUUID().replace(/-/g, ""),
        to,
        subject,
        result.success ? "sent" : "failed",
        result.id || null,
        result.error || null,
      ],
    );
  } catch (logErr) {
    // email_history table may not exist yet; don't crash
    console.warn("[Email] Failed to log to email_history:", logErr);
  }

  return result;
}

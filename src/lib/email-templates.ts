import { SITE_URL } from "@/lib/site-config";

/* ---------------------------------------------------------------------------
 * Shared helpers
 * --------------------------------------------------------------------------- */

function formatCurrency(cents: number, _currency?: string): string {
  const amount = (cents / 100).toFixed(2);
  return `$${amount}`;
}

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Logo -->
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <span style="font-size:24px;font-weight:700;color:#1a1a2e;letter-spacing:-0.5px;">AI Armory</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 40px 32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">AI Armory | <a href="mailto:support@aiarmory.shop" style="color:#9ca3af;">support@aiarmory.shop</a></p>
              <p style="margin:8px 0 0;font-size:12px;color:#c0c0c0;"><a href="${SITE_URL}" style="color:#c0c0c0;text-decoration:underline;">aiarmory.shop</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td style="background-color:#6366F1;border-radius:6px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/* ---------------------------------------------------------------------------
 * Templates
 * --------------------------------------------------------------------------- */

interface PurchaseConfirmationParams {
  customerEmail: string;
  productName: string;
  orderNumber: string;
  pricePaid: number;
  currency: string;
  downloadUrl: string;
}

export function purchaseConfirmation({
  productName,
  orderNumber,
  pricePaid,
  currency,
  downloadUrl,
}: PurchaseConfirmationParams): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">Thank you for your purchase!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">Your order has been confirmed and your download is ready.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:6px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Product</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${productName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Order Number</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${orderNumber}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${formatCurrency(pricePaid, currency)}</p>
        </td>
      </tr>
    </table>

    ${ctaButton("Download Now", downloadUrl)}

    <p style="margin:24px 0 0;font-size:14px;color:#6b7280;text-align:center;">
      You can also access your purchases from your <a href="${SITE_URL}/account" style="color:#6366F1;text-decoration:underline;">account page</a>.
    </p>
  `);
}

/* --------------------------------------------------------------------------- */

interface NewsletterWelcomeParams {
  email: string;
}

export function newsletterWelcome({ email }: NewsletterWelcomeParams): string {
  // Build HMAC unsubscribe token inline (same logic as unsubscribe route)
  const crypto = require("crypto") as typeof import("crypto");
  const secret =
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ||
    "newsletter-unsubscribe-fallback-secret-change-me";
  const token = crypto
    .createHmac("sha256", secret)
    .update(email.toLowerCase().trim())
    .digest("hex");
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">Welcome to AI Armory!</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.6;">
      Thanks for subscribing. You are now on the list for the best AI tools, templates, and resources.
    </p>

    <h2 style="margin:24px 0 8px;font-size:16px;color:#1a1a2e;">What to expect</h2>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:15px;color:#4b5563;line-height:1.8;">
      <li>New product launches and early access</li>
      <li>Exclusive discounts for subscribers</li>
      <li>Tips on AI productivity and smart home tech</li>
    </ul>

    ${ctaButton("Browse the Shop", SITE_URL)}

    <p style="margin:24px 0 0;font-size:12px;color:#c0c0c0;text-align:center;">
      Don't want to hear from us? <a href="${unsubscribeUrl}" style="color:#c0c0c0;text-decoration:underline;">Unsubscribe</a>
    </p>
  `);
}

/* --------------------------------------------------------------------------- */

interface ServiceEnquiryConfirmationParams {
  customerName: string;
  serviceName: string;
}

export function serviceEnquiryConfirmation({
  customerName,
  serviceName,
}: ServiceEnquiryConfirmationParams): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">We received your enquiry!</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.6;">
      Hi ${customerName}, thanks for reaching out about <strong>${serviceName}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
      Our team will review your request and get back to you within <strong>24 hours</strong>.
    </p>

    ${ctaButton("Visit AI Armory", SITE_URL)}
  `);
}

/* --------------------------------------------------------------------------- */

interface ServiceEnquiryNotificationParams {
  customerName: string;
  email: string;
  company?: string;
  message: string;
  serviceName: string;
  contactMethod?: string;
}

export function serviceEnquiryNotification({
  customerName,
  email,
  company,
  message,
  serviceName,
  contactMethod,
}: ServiceEnquiryNotificationParams): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">New Service Enquiry</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;">A new enquiry has been submitted.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:6px;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Name</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${customerName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Email</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;"><a href="mailto:${email}" style="color:#6366F1;">${email}</a></p>
        </td>
      </tr>
      ${
        company
          ? `<tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Company</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${company}</p>
        </td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Service</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${serviceName}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Preferred Contact</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;font-weight:600;">${contactMethod || "email"}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;">
          <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Message</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;white-space:pre-wrap;">${message}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:#6b7280;text-align:center;">
      <a href="mailto:${email}" style="color:#6366F1;text-decoration:underline;">Reply to ${customerName}</a>
    </p>
  `);
}

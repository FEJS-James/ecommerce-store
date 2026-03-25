import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = typeof body.customer_id === "string" ? body.customer_id : null;
    const productId = typeof body.product_id === "string" ? body.product_id : null;
    const orderId = typeof body.order_id === "string" ? body.order_id : null;

    if (!productId) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || null;

    const id = crypto.randomUUID().replace(/-/g, "");

    await execute(
      `INSERT INTO downloads (id, customer_id, product_id, order_id, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, customerId, productId, orderId, ipAddress, userAgent],
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Download track error:", error);
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 });
  }
}

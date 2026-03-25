import { NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface DownloadRow {
  id: string;
  customer_id: string | null;
  product_id: string | null;
  order_id: string | null;
  downloaded_at: string;
  ip_address: string | null;
  user_agent: string | null;
  product_name: string | null;
  customer_email: string | null;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = request.nextUrl.searchParams;
    const productId = params.get("product_id");
    const customerId = params.get("customer_id");
    const startDate = params.get("start_date");
    const endDate = params.get("end_date");
    const limit = Math.min(Math.max(parseInt(params.get("limit") || "100", 10), 1), 1000);
    const offset = Math.max(parseInt(params.get("offset") || "0", 10), 0);

    let where = "WHERE 1=1";
    const args: (string | number)[] = [];

    if (productId) { where += " AND d.product_id = ?"; args.push(productId); }
    if (customerId) { where += " AND d.customer_id = ?"; args.push(customerId); }
    if (startDate) { where += " AND date(d.downloaded_at) >= ?"; args.push(startDate); }
    if (endDate) { where += " AND date(d.downloaded_at) <= ?"; args.push(endDate); }

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM downloads d ${where}`,
      args,
    );
    const total = Number(countResult?.total ?? 0);

    const downloads = await queryAll<DownloadRow>(
      `SELECT d.*, p.name as product_name, c.email as customer_email
       FROM downloads d
       LEFT JOIN products p ON p.id = d.product_id
       LEFT JOIN customers c ON c.id = d.customer_id
       ${where}
       ORDER BY d.downloaded_at DESC
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    );

    return NextResponse.json({
      downloads: Array.isArray(downloads) ? downloads : [],
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin downloads error:", error);
    return NextResponse.json({ error: "Failed to load downloads" }, { status: 500 });
  }
}

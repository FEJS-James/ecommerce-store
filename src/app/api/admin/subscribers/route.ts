import { NextRequest, NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import type { EmailSubscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = request.nextUrl.searchParams;
    const format = params.get("format");
    const source = params.get("source");
    const status = params.get("status");
    const startDate = params.get("start_date");
    const endDate = params.get("end_date");
    const search = params.get("search");

    let where = "WHERE 1=1";
    const args: string[] = [];

    if (source) {
      where += " AND es.source = ?";
      args.push(source);
    }
    if (status) {
      where += " AND es.status = ?";
      args.push(status);
    } else {
      where += " AND es.status = 'active'";
    }
    if (startDate) {
      where += " AND date(es.subscribed_at) >= ?";
      args.push(startDate);
    }
    if (endDate) {
      where += " AND date(es.subscribed_at) <= ?";
      args.push(endDate);
    }
    if (search) {
      where += " AND es.email LIKE ?";
      args.push(`%${search}%`);
    }

    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM email_subscribers es ${where}`,
      args,
    );
    const total = Number(countResult?.total ?? 0);

    const subscribers = await queryAll<EmailSubscriber>(
      `SELECT es.* FROM email_subscribers es ${where} ORDER BY es.subscribed_at DESC`,
      args,
    );

    if (format === "csv") {
      const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];
      const headers = ["email", "name", "source", "lead_magnet", "status", "subscribed_at", "unsubscribed_at"];
      const csvRows = [headers.join(",")];

      for (const sub of safeSubscribers) {
        const row = [
          `"${(sub.email ?? "").replace(/"/g, '""')}"`,
          `"${(sub.name ?? "").replace(/"/g, '""')}"`,
          `"${(sub.source ?? "").replace(/"/g, '""')}"`,
          `"${(sub.lead_magnet ?? "").replace(/"/g, '""')}"`,
          `"${sub.status ?? "active"}"`,
          `"${sub.subscribed_at ?? ""}"`,
          `"${sub.unsubscribed_at ?? ""}"`,
        ];
        csvRows.push(row.join(","));
      }

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=subscribers.csv",
        },
      });
    }

    return NextResponse.json({
      subscribers: Array.isArray(subscribers) ? subscribers : [],
      total,
    });
  } catch (error) {
    console.error("Subscribers error:", error);
    return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
  }
}

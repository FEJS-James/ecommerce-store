import { NextRequest, NextResponse } from "next/server";

interface EnquiryBody {
  name: string;
  email: string;
  company?: string;
  message: string;
  contactMethod?: "email" | "video";
  serviceName: string;
  servicePrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EnquiryBody;

    const { name, email, message, serviceName } = body;

    if (!name || !email || !message || !serviceName) {
      return NextResponse.json(
        { error: "Name, email, message, and service are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Log the enquiry (in production, this would save to DB or send email)
    console.log("[Service Enquiry]", {
      name,
      email,
      company: body.company || "N/A",
      contactMethod: body.contactMethod || "email",
      service: serviceName,
      price: body.servicePrice,
      message: message.substring(0, 200),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: "Enquiry received" },
      { status: 200 }
    );
  } catch {
    console.error("[Service Enquiry] Error processing request");
    return NextResponse.json(
      { error: "Failed to process enquiry" },
      { status: 500 }
    );
  }
}

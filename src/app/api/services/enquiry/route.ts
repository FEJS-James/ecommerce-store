import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, description, serviceName, businessName, contactMethod } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Description is required" },
        { status: 400 }
      );
    }

    if (!serviceName || typeof serviceName !== "string") {
      return NextResponse.json(
        { success: false, message: "Service name is required" },
        { status: 400 }
      );
    }

    // Log the enquiry for now — email integration later
    console.log("[Service Enquiry]", {
      serviceName,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      businessName: businessName?.trim() || null,
      description: description.trim(),
      contactMethod: contactMethod || "email",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry received",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}

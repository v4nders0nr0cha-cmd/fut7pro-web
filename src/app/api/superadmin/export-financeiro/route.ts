import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering to avoid prerender errors
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Placeholder response to prevent prerender errors
    return NextResponse.json({
      message: "Export financeiro endpoint",
      data: [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

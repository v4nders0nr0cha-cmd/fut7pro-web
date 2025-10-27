import { NextRequest, NextResponse } from "next/server";

// Runtime configuration for Node.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Headers para evitar cache e problemas de prerender
    const response = NextResponse.json({
      message: "Export financeiro endpoint",
      data: [],
    });

    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    const response = NextResponse.json({ error: "Internal server error" }, { status: 500 });
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return response;
  }
}

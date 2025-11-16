import { NextRequest } from "next/server";
import { forwardSuperAdminRequest } from "../_proxy/forward";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  return forwardSuperAdminRequest(req, "/superadmin/config");
}

export async function PUT(req: NextRequest) {
  const body = await req.text();
  return forwardSuperAdminRequest(req, "/superadmin/config", {
    method: "PUT",
    body,
  });
}

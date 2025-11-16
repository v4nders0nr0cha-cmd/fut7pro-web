import { NextRequest } from "next/server";
import { forwardSuperAdminRequest } from "../../_proxy/forward";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.text();
  return forwardSuperAdminRequest(req, `/superadmin/integracoes/${params.slug}`, {
    method: "PUT",
    body,
  });
}

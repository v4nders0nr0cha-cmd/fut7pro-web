// src/app/api/superadmin/marketing/pagar-venda/route.ts

import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (isProd && isWebDirectDbDisabled) {
    return NextResponse.json(
      { error: "web_db_disabled: use a API do backend para superadmin/marketing/pagar-venda" },
      { status: 501 }
    );
  }
  const data = await request.formData();
  const id = data.get("id")?.toString();
  if (!id) return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });

  await prisma.influencerVenda.update({
    where: { id },
    data: {
      status: "pago",
      pagoEm: new Date(),
    },
  });

  return NextResponse.redirect(request.headers.get("referer") || "/superadmin/marketing", 303);
}

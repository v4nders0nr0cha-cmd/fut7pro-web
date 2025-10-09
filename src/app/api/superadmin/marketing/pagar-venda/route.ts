// src/app/api/superadmin/marketing/pagar-venda/route.ts

import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

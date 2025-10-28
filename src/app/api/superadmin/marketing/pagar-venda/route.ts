// src/app/api/superadmin/marketing/pagar-venda/route.ts

import { NextResponse } from "next/server";
import { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked, prisma } from "@/server/prisma";

export async function POST(request: Request) {
  const data = await request.formData();
  const id = data.get("id")?.toString();
  if (!id) return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });

  if (isDirectDbBlocked) {
    return NextResponse.json({ ok: false, error: PRISMA_DISABLED_MESSAGE }, { status: 501 });
  }

  await prisma.influencerVenda.update({
    where: { id },
    data: {
      status: "pago",
      pagoEm: new Date(),
    },
  });

  return NextResponse.redirect(request.headers.get("referer") || "/superadmin/marketing", 303);
}

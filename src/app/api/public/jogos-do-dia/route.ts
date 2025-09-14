import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.fut7pro.com.br";
// Em prod, aponte BACKEND_URL para o host real do backend (Railway/ingress) sem expor no cliente.

export const dynamic = "force-dynamic"; // ou use cache revalidate se quiser (ex: export const revalidate = 120;)

export async function GET() {
  try {
    const url = `${BACKEND_URL}/partidas/jogos-do-dia`;
    const r = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return NextResponse.json(
        { error: "upstream_error", status: r.status, detail: text },
        { status: 502 }
      );
    }

    const data = await r.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "proxy_failed", message: e?.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export const runtime = "edge"; // opcional (latência menor)
export const dynamic = "force-dynamic"; // não cachear build

const BACKEND_URL = process.env.BACKEND_URL!; // defina no Vercel

export async function GET() {
  try {
    const r = await fetch(`${BACKEND_URL}/partidas/jogos-do-dia`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      // next: { revalidate: 60 } // alternativa a cache header
    });

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return NextResponse.json(
        { error: "upstream_error", status: r.status, detail: body.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await r.json();
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "proxy_failed", message: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

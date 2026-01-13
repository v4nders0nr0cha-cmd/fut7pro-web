import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function GET() {
  const baseUrl = normalizeBase(getApiBase());

  try {
    const res = await fetch(`${baseUrl}/public/plans/catalog`, { cache: "no-store" });
    const text = await res.text();

    if (!res.ok) {
      return new Response(JSON.stringify({ message: text || "Erro ao carregar planos" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ message: "Erro ao carregar planos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

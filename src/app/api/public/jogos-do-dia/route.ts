export const runtime = "edge";

const CACHE = "s-maxage=60, stale-while-revalidate=300";

async function fetchUpstream() {
  if (!process.env.BACKEND_URL) {
    return new Response(JSON.stringify({ error: "BACKEND_URL not configured" }), {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const url = `${process.env.BACKEND_URL}/partidas/jogos-do-dia`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Upstream error", status: res.status }), {
        status: res.status,
        headers: { "Cache-Control": "no-store" },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": CACHE,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Fetch failed" }), {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function GET() {
  return fetchUpstream();
}

export async function HEAD() {
  const res = await fetchUpstream();
  // devolve apenas os headers (sem body) para HEAD
  return new Response(null, { status: res.status, headers: res.headers });
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const GONE_PAYLOAD = {
  error: "Endpoint legado desativado",
  code: "ENDPOINT_GONE",
  replacement: "/api/public/jogos-do-dia",
};

function goneJson() {
  return NextResponse.json(GONE_PAYLOAD, {
    status: 410,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export async function GET() {
  return goneJson();
}

export async function HEAD() {
  return new Response(null, {
    status: 410,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

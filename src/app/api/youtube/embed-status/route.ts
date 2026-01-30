import { NextResponse } from "next/server";
import { extractYouTubeId } from "@/utils/youtube";

function extractPlayerResponse(html: string) {
  const marker = "ytInitialPlayerResponse";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = html.indexOf("{", markerIndex);
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i += 1) {
    const char = html[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth += 1;
      continue;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const json = html.slice(start, i + 1);
        try {
          return JSON.parse(json);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const urlParam = searchParams.get("url");
  const id = idParam || (urlParam ? extractYouTubeId(urlParam) : null);

  if (!id) {
    return NextResponse.json({ embeddable: null, error: "id-required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.youtube.com/embed/${id}`, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        embeddable: null,
        status: "unknown",
        reason: "Nao foi possivel verificar o video.",
      });
    }

    const html = await response.text();
    const playerResponse = extractPlayerResponse(html);
    if (!playerResponse) {
      return NextResponse.json({ embeddable: null, status: "unknown" });
    }

    const playability = playerResponse?.playabilityStatus ?? {};
    const status = playability?.status;
    const embeddableFlag = playability?.playableInEmbed;
    const embeddable = embeddableFlag === false ? false : status && status !== "OK" ? false : true;
    const reason =
      playability?.reason ||
      playability?.errorScreen?.playerErrorMessageRenderer?.reason?.simpleText ||
      playability?.errorScreen?.playerErrorMessageRenderer?.subreason?.simpleText ||
      null;

    return NextResponse.json({
      embeddable,
      status: status || "unknown",
      reason,
    });
  } catch {
    return NextResponse.json({ embeddable: null, status: "unknown" });
  }
}

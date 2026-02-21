import { NextResponse } from "next/server";
import { isSuperAdminLegacyEnabled } from "@/lib/feature-flags";

export function blockLegacySuperAdminApiWhenDisabled() {
  if (isSuperAdminLegacyEnabled()) {
    return null;
  }

  return NextResponse.json(
    { error: "Rota nao encontrada" },
    {
      status: 404,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

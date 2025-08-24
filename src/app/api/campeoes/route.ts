import { NextRequest, NextResponse } from "next/server";
import { campeoesMock } from "@/components/lists/mockCampeoes";

export async function GET(request: NextRequest) {
  try {
    // Tentar buscar dados do backend primeiro
    const rachaId = request.nextUrl.searchParams.get("rachaId") || "demo";

    // Aqui você pode implementar a lógica real do backend
    // Por enquanto, retornamos os mocks padronizados
    const campeoes = campeoesMock.filter((c) => c.rachaId === rachaId);

    return NextResponse.json(campeoes);
  } catch (error) {
    // Se falhar, retornar mocks como fallback
    console.log("🔄 API falhou, retornando mocks:", error);

    const rachaId = request.nextUrl.searchParams.get("rachaId") || "demo";
    const campeoes = campeoesMock.filter((c) => c.rachaId === rachaId);

    return NextResponse.json(campeoes);
  }
}

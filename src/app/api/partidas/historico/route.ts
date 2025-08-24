import { NextRequest, NextResponse } from "next/server";
import { partidasMock } from "@/components/lists/mockPartidas";

export async function GET(request: NextRequest) {
  try {
    // Tentar buscar dados do backend primeiro
    const rachaId = request.nextUrl.searchParams.get("rachaId") || "demo";

    // Aqui você pode implementar a lógica real do backend
    // Por enquanto, retornamos os mocks padronizados
    const partidas = partidasMock.map((p) => ({
      ...p,
      // Adicionar campos que podem estar faltando
      hora: p.hora || "20:00",
      timeCasa: {
        nome: p.timeA,
        logo: `/images/times/time_padrao_01.png`,
        gols: p.golsTimeA,
      },
      timeFora: {
        nome: p.timeB,
        logo: `/images/times/time_padrao_02.png`,
        gols: p.golsTimeB,
      },
      destaque: p.gols?.[0]
        ? {
            nome: p.gols[0].jogador,
            tipo: "gol",
          }
        : undefined,
    }));

    return NextResponse.json(partidas);
  } catch (error) {
    // Se falhar, retornar mocks como fallback
    console.log("🔄 API falhou, retornando mocks:", error);

    const partidas = partidasMock.map((p) => ({
      ...p,
      hora: p.hora || "20:00",
      timeCasa: {
        nome: p.timeA,
        logo: `/images/times/time_padrao_01.png`,
        gols: p.golsTimeA,
      },
      timeFora: {
        nome: p.timeB,
        logo: `/images/times/time_padrao_02.png`,
        gols: p.golsTimeB,
      },
      destaque: p.gols?.[0]
        ? {
            nome: p.gols[0].jogador,
            tipo: "gol",
          }
        : undefined,
    }));

    return NextResponse.json(partidas);
  }
}

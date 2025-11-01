// Dados estaticos usados quando o backend estiver indisponivel.
// Mantem o build estatico saudavel e fornece contexto minimo para a UI.
export const JOGOS_DO_DIA_FALLBACK = [
  {
    id: "fallback-1",
    timeA: "Time A",
    timeB: "Time B",
    golsTimeA: 0,
    golsTimeB: 0,
    finalizada: false,
    data: new Date().toISOString(),
    _fallback: true,
  },
];

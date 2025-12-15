"use client";
import { useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { rachaConfig } from "@/config/racha.config";
import {
  buildDestaquesDoDia,
  getEventosDoDia,
  getPontosPorTime,
  getTimeCampeao,
  type ConfrontoV2,
  type TimeDestaque,
  type EventoGolV2,
} from "@/utils/destaquesDoDia";
import type { PublicMatch } from "@/types/partida";

type Props = {
  confrontos?: ConfrontoV2[];
  times?: TimeDestaque[];
  matches?: PublicMatch[];
  slug?: string;
  isLoading?: boolean;
};

type Jogador = { nome: string; apelido: string; pos: string };

export default function CardsDestaquesDiaV2({
  confrontos,
  times,
  matches,
  slug,
  isLoading,
}: Props) {
  const { tenantSlug } = useRacha();
  const [zagueiroSelecionado, setZagueiroSelecionado] = useState<string>("");
  const [faltou, setFaltou] = useState<Record<string, boolean>>({});

  const slugFinal = slug || tenantSlug || rachaConfig.slug;
  const shouldFetchMatches = !matches && (!confrontos || confrontos.length === 0);

  const {
    matches: fetchedMatches,
    isLoading: loadingMatches,
    isError: erroMatches,
  } = usePublicMatches({
    slug: slugFinal,
    scope: "recent",
    limit: 6,
    enabled: shouldFetchMatches,
  });

  const fonteMatches = matches ?? fetchedMatches;

  const {
    confrontos: baseConfrontos,
    times: baseTimes,
    dataReferencia,
  } = useMemo(
    () =>
      fonteMatches?.length
        ? buildDestaquesDoDia(fonteMatches)
        : {
            confrontos: confrontos ?? [],
            times: times ?? [],
            dataReferencia: null as string | null,
          },
    [fonteMatches, confrontos, times]
  );

  const pontosPorTime = useMemo(() => getPontosPorTime(baseConfrontos), [baseConfrontos]);
  const campeaoInfo = useMemo(
    () => getTimeCampeao(baseConfrontos, baseTimes),
    [baseConfrontos, baseTimes]
  );
  const timeCampeao = campeaoInfo?.time ?? null;

  const eventosDia = useMemo(() => getEventosDoDia(baseConfrontos), [baseConfrontos]);

  function getArtilheiroMaestro(dados: EventoGolV2[] = [], prop: "jogador" | "assistencia") {
    const cont: Record<string, number> = {};
    (dados ?? []).forEach((ev) => {
      if (ev && ev[prop] && ev[prop] !== "faltou")
        cont[ev[prop] as string] = (cont[ev[prop] as string] ?? 0) + 1;
    });
    const ord = Object.entries(cont).sort((a, b) => b[1] - a[1]);
    return ord.length > 0 ? { nome: ord[0][0], qtd: ord[0][1] } : null;
  }

  function contarEventosJogadorTimeCampeao(pos: "ATA" | "MEIA") {
    if (!timeCampeao) return undefined;
    const jogadoresFiltrados = (timeCampeao.jogadores ?? []).filter((j) => j.pos === pos);
    if (!jogadoresFiltrados.length) return undefined;
    const cont: Record<string, number> = {};
    (eventosDia ?? []).forEach((ev) => {
      if (ev && ev.jogador && jogadoresFiltrados.some((j) => j.nome === ev.jogador))
        cont[ev.jogador] = (cont[ev.jogador] ?? 0) + 1;
    });
    const ord = Object.entries(cont).sort((a, b) => b[1] - a[1]);
    if (!ord.length) return undefined;
    const encontrado = (timeCampeao.jogadores ?? []).find((j) => j.nome === ord[0][0]);
    return encontrado ?? undefined;
  }

  function contarAssistenciasMeiaTimeCampeao() {
    if (!timeCampeao) return undefined;
    const jogadoresFiltrados = (timeCampeao.jogadores ?? []).filter((j) => j.pos === "MEIA");
    if (!jogadoresFiltrados.length) return undefined;
    const cont: Record<string, number> = {};
    (eventosDia ?? []).forEach((ev) => {
      if (ev && ev.assistencia && jogadoresFiltrados.some((j) => j.nome === ev.assistencia))
        cont[ev.assistencia] = (cont[ev.assistencia] ?? 0) + 1;
    });
    const ord = Object.entries(cont).sort((a, b) => b[1] - a[1]);
    if (!ord.length) return undefined;
    const encontrado = (timeCampeao.jogadores ?? []).find((j) => j.nome === ord[0][0]);
    return encontrado ?? undefined;
  }

  const goleiro =
    (timeCampeao?.jogadores ?? []).find((j) => j.pos === "GOL") ||
    (baseTimes[0]?.jogadores ?? []).find((j) => j.pos === "GOL");
  const zagueiros = (timeCampeao?.jogadores ?? []).filter((j) => j.pos === "ZAG") ?? [];

  const atacante = contarEventosJogadorTimeCampeao("ATA");
  const meia = contarAssistenciasMeiaTimeCampeao();
  const artilheiro = getArtilheiroMaestro(eventosDia, "jogador");
  const maestro = getArtilheiroMaestro(eventosDia, "assistencia");

  const golsAtacante = atacante?.nome
    ? (eventosDia ?? []).filter((e) => e?.jogador === atacante.nome).length
    : 0;

  const assistenciasMeia = meia?.nome
    ? (eventosDia ?? []).filter((e) => e?.assistencia === meia.nome).length
    : 0;

  function fotoByIndex(i: number) {
    const fotos = [
      "/images/jogadores/jogador_padrao_01.jpg",
      "/images/jogadores/jogador_padrao_02.jpg",
      "/images/jogadores/jogador_padrao_03.jpg",
      "/images/jogadores/jogador_padrao_04.jpg",
    ];
    return fotos[i % fotos.length];
  }

  const loading = isLoading || (shouldFetchMatches && loadingMatches);
  const semDados = !loading && baseConfrontos.length === 0;

  const aguardando = (
    <div className="w-full text-center text-zinc-400 font-semibold py-8">
      {erroMatches
        ? "Nao foi possivel carregar os resultados do dia."
        : "Aguarde: resultados precisam ser lancados para exibir os destaques do dia."}
    </div>
  );

  function CardDestaque({
    titulo,
    nome = "",
    apelido = "",
    pos = "",
    foto = "",
    infoExtra = "",
    canFaltou,
    faltouKey,
    zagueiroManual,
    onZagueiroChange,
    options = [],
    selected = "",
  }: any) {
    if (zagueiroManual) {
      if (selected && options?.length) {
        const zagueiro = options.find((j: Jogador) => j.nome === selected);
        return (
          <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-between relative">
            <img
              src={fotoByIndex(2)}
              alt={zagueiro?.nome ?? ""}
              className="w-20 h-20 rounded-full mb-2 object-cover border-4 border-yellow-400"
            />
            <div className="text-yellow-400 font-bold text-sm text-center mb-1 uppercase">
              {titulo}
            </div>
            <div className="text-white text-lg font-bold text-center">{zagueiro?.nome ?? ""}</div>
            <div className="text-yellow-200 text-xs">
              {zagueiro?.apelido ?? ""} {zagueiro?.pos ? `| ${zagueiro.pos}` : ""}
            </div>
            {canFaltou && (
              <label className="flex items-center gap-1 mt-2 text-xs text-yellow-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!faltou?.["Zagueiro"]}
                  onChange={(e) =>
                    setFaltou((prev: Record<string, boolean>) => ({
                      ...prev,
                      ["Zagueiro"]: e.target.checked,
                    }))
                  }
                />
                Jogador nao compareceu ao racha
              </label>
            )}
            <div className="h-6"></div>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-center relative">
          <div className="text-yellow-400 font-bold text-sm text-center mb-3 uppercase">
            {titulo}
          </div>
          <select
            className="px-2 py-1 bg-zinc-900 text-yellow-200 rounded w-full"
            value={selected}
            onChange={(e) => onZagueiroChange?.(e.target.value)}
          >
            <option value="">Selecione zagueiro...</option>
            {(options ?? []).map((j: Jogador, idx: number) => (
              <option key={j?.nome ?? idx} value={j?.nome ?? ""}>
                {j?.nome ?? ""} {j?.apelido ? `(${j.apelido})` : ""}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-between relative">
        {foto ? (
          <img
            src={foto}
            alt={nome || titulo}
            className="w-20 h-20 rounded-full mb-2 object-cover border-4 border-yellow-400"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mb-2 flex items-center justify-center bg-zinc-900 border-4 border-yellow-400" />
        )}
        <div className="text-yellow-400 font-bold text-sm text-center mb-1 uppercase">{titulo}</div>
        {nome ? (
          <>
            <div className="text-white text-lg font-bold text-center">{nome}</div>
            <div className="text-yellow-200 text-xs">
              {apelido ? apelido : ""} {pos ? `| ${pos}` : ""}
            </div>
            {infoExtra && <div className="mt-1 text-yellow-400 text-sm font-bold">{infoExtra}</div>}
            {canFaltou && (
              <label className="flex items-center gap-1 mt-2 text-xs text-yellow-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!faltou?.[faltouKey]}
                  onChange={(e) =>
                    setFaltou((prev: Record<string, boolean>) => ({
                      ...prev,
                      [faltouKey]: e.target.checked,
                    }))
                  }
                />
                Jogador nao compareceu ao racha
              </label>
            )}
            <div className="h-6"></div>
          </>
        ) : (
          <div className="text-zinc-400 mt-4 text-center">Aguardando resultado...</div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-8 text-gray-300">
        Carregando destaques do dia...
      </div>
    );
  }

  if (semDados) {
    return aguardando;
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {dataReferencia && (
        <span className="text-xs uppercase tracking-wide text-yellow-400">
          Referencia: {new Date(dataReferencia).toLocaleDateString("pt-BR")}
        </span>
      )}
      <div className="flex flex-wrap gap-5 justify-center">
        <CardDestaque
          titulo="ATACANTE DO DIA"
          nome={atacante?.nome ?? ""}
          apelido={atacante?.apelido ?? ""}
          pos={atacante?.pos ?? ""}
          foto={atacante ? fotoByIndex(0) : ""}
          infoExtra={atacante?.nome ? `${golsAtacante} gols` : ""}
          canFaltou={true}
          faltouKey="Atacante"
        />
        <CardDestaque
          titulo="MEIA DO DIA"
          nome={meia?.nome ?? ""}
          apelido={meia?.apelido ?? ""}
          pos={meia?.pos ?? ""}
          foto={meia ? fotoByIndex(1) : ""}
          infoExtra={meia?.nome ? `${assistenciasMeia} assistencias` : ""}
          canFaltou={true}
          faltouKey="Meia"
        />
        <CardDestaque
          titulo="ZAGUEIRO DO DIA"
          zagueiroManual
          options={Array.isArray(zagueiros) ? zagueiros : []}
          selected={zagueiroSelecionado ?? ""}
          onZagueiroChange={setZagueiroSelecionado}
          canFaltou={true}
        />
        <CardDestaque
          titulo="GOLEIRO DO DIA"
          nome={goleiro?.nome ?? ""}
          apelido={goleiro?.apelido ?? ""}
          pos={goleiro?.pos ?? ""}
          foto={goleiro ? fotoByIndex(2) : ""}
          canFaltou={true}
          faltouKey="Goleiro"
        />
      </div>
      <div className="flex flex-wrap gap-5 justify-center mt-2">
        <CardDestaque
          titulo="TIME CAMPEAO DO DIA"
          nome={timeCampeao?.nome ?? ""}
          apelido=""
          foto={timeCampeao?.logoUrl || "/images/logos/logo_fut7pro.png"}
          infoExtra={
            timeCampeao && campeaoInfo?.pontos !== undefined
              ? `${campeaoInfo.pontos} pontos`
              : pontosPorTime && Object.keys(pontosPorTime).length
                ? `${Math.max(...Object.values(pontosPorTime))} pontos`
                : ""
          }
        />
        <CardDestaque
          titulo="ARTILHEIRO DO DIA"
          nome={artilheiro?.nome ?? ""}
          apelido=""
          foto={artilheiro ? fotoByIndex(3) : ""}
          infoExtra={artilheiro?.qtd ? `${artilheiro.qtd} gols` : ""}
        />
        <CardDestaque
          titulo="MAESTRO DO DIA"
          nome={maestro?.nome ?? ""}
          apelido=""
          foto={maestro ? fotoByIndex(2) : ""}
          infoExtra={maestro?.qtd ? `${maestro.qtd} assistencias` : ""}
        />
      </div>
      {(eventosDia?.length ?? 0) === 0 && aguardando}
    </div>
  );
}

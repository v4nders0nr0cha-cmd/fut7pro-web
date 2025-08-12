"use client";
import { useState, useMemo } from "react";

// Tipos
type Jogador = { nome: string; apelido: string; pos: string };
type Time = { nome: string; jogadores: Jogador[] };
type EventoGol = { time: "a" | "b"; jogador: string; assistencia: string };
type ResultadoPartida = { placar: { a: number; b: number }; eventos: EventoGol[] };
type Confronto = {
  ida: { a: number; b: number };
  volta: { a: number; b: number };
  resultadoIda?: ResultadoPartida | null;
  resultadoVolta?: ResultadoPartida | null;
};
type Props = {
  confrontos: Confronto[];
  times: Time[];
};

export default function CardsDestaquesDiaV2({ confrontos, times }: Props) {
  const fotos = [
    "/images/jogadores/jogador_padrao_01.jpg",
    "/images/jogadores/jogador_padrao_02.jpg",
    "/images/jogadores/jogador_padrao_03.jpg",
    "/images/jogadores/jogador_padrao_04.jpg",
  ];

  const pontosPorTime = useMemo(() => {
    const pontos: Record<number, number> = {};
    (confrontos ?? []).forEach((c) => {
      if (c?.resultadoIda?.placar) {
        const placar = c.resultadoIda.placar;
        if (placar.a > placar.b) {
          pontos[c.ida.a] = (pontos[c.ida.a] ?? 0) + 3;
          pontos[c.ida.b] = pontos[c.ida.b] ?? 0;
        } else if (placar.b > placar.a) {
          pontos[c.ida.b] = (pontos[c.ida.b] ?? 0) + 3;
          pontos[c.ida.a] = pontos[c.ida.a] ?? 0;
        } else {
          pontos[c.ida.a] = (pontos[c.ida.a] ?? 0) + 1;
          pontos[c.ida.b] = (pontos[c.ida.b] ?? 0) + 1;
        }
      }
      if (c?.resultadoVolta?.placar) {
        const placar = c.resultadoVolta.placar;
        if (placar.a > placar.b) {
          pontos[c.volta.a] = (pontos[c.volta.a] ?? 0) + 3;
          pontos[c.volta.b] = pontos[c.volta.b] ?? 0;
        } else if (placar.b > placar.a) {
          pontos[c.volta.b] = (pontos[c.volta.b] ?? 0) + 3;
          pontos[c.volta.a] = pontos[c.volta.a] ?? 0;
        } else {
          pontos[c.volta.a] = (pontos[c.volta.a] ?? 0) + 1;
          pontos[c.volta.b] = (pontos[c.volta.b] ?? 0) + 1;
        }
      }
    });
    return pontos;
  }, [confrontos]);

  const indexTimeCampeao = useMemo(() => {
    const arr = Object.entries(pontosPorTime ?? {});
    if (!arr.length) return null;
    return Number(arr.sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? null);
  }, [pontosPorTime]);

  const timeCampeao =
    typeof indexTimeCampeao === "number" &&
    indexTimeCampeao !== null &&
    Array.isArray(times) &&
    times[indexTimeCampeao] !== undefined
      ? times[indexTimeCampeao]
      : null;

  const eventosDia = useMemo(() => {
    let eventos: EventoGol[] = [];
    (confrontos ?? []).forEach((c) => {
      if (Array.isArray(c?.resultadoIda?.eventos))
        eventos = eventos.concat(c.resultadoIda!.eventos);
      if (Array.isArray(c?.resultadoVolta?.eventos))
        eventos = eventos.concat(c.resultadoVolta!.eventos);
    });
    return eventos;
  }, [confrontos]);

  function getArtilheiroMaestro(dados: EventoGol[] = [], prop: "jogador" | "assistencia") {
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

  const goleiro = (timeCampeao?.jogadores ?? []).find((j) => j.pos === "GOL") || undefined;
  const zagueiros = (timeCampeao?.jogadores ?? []).filter((j) => j.pos === "ZAG") ?? [];
  const [zagueiroSelecionado, setZagueiroSelecionado] = useState<string>("");

  const [faltou, setFaltou] = useState<Record<string, boolean>>({});

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
    return fotos[i % fotos.length];
  }

  const aguardando = (
    <div className="w-full text-center text-zinc-400 font-semibold py-8">
      Aguarde: resultados precisam ser lançados para exibir os destaques do dia.
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
                Jogador não compareceu ao racha
              </label>
            )}
            <div className="h-6"></div>
          </div>
        );
      } else {
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
    }

    // Cards comuns
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
                Jogador não compareceu ao racha
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

  return (
    <div className="w-full flex flex-col items-center gap-8">
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
          infoExtra={meia?.nome ? `${assistenciasMeia} assistências` : ""}
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
          titulo="TIME CAMPEÃO DO DIA"
          nome={timeCampeao?.nome ?? ""}
          apelido=""
          foto={timeCampeao ? "/images/logos/logo_fut7pro.png" : ""}
          infoExtra={
            timeCampeao &&
            typeof indexTimeCampeao === "number" &&
            indexTimeCampeao !== null &&
            pontosPorTime?.[indexTimeCampeao!] !== undefined
              ? `${pontosPorTime[indexTimeCampeao]} pontos`
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
          infoExtra={maestro?.qtd ? `${maestro.qtd} assistências` : ""}
        />
      </div>
      {(eventosDia?.length ?? 0) === 0 && aguardando}
    </div>
  );
}

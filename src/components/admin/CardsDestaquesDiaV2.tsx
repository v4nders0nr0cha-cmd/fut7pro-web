"use client";
import { useEffect, useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { usePublicMatches } from "@/hooks/usePublicMatches";
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

const BOT_PLAYER_IMAGE = "/images/jogadores/Jogador-Reserva.png";
const BOT_GOALKEEPER_IMAGE = "/images/jogadores/Goleiro-Reserva.png";
const DEFAULT_PLAYER_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";

function normalizeKey(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function orderIndex(list: string[], id: string) {
  const idx = list.indexOf(id);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function pickPlayer(
  list: PlayerStat[],
  primary: "goals" | "assists",
  secondary: "goals" | "assists",
  order?: string[]
) {
  if (!list.length) return null;
  return [...list].sort((a, b) => {
    if (b[primary] !== a[primary]) return b[primary] - a[primary];
    if (b[secondary] !== a[secondary]) return b[secondary] - a[secondary];
    if (order?.length) {
      return orderIndex(order, a.id) - orderIndex(order, b.id);
    }
    return 0;
  })[0];
}

type Props = {
  confrontos?: ConfrontoV2[];
  times?: TimeDestaque[];
  matches?: PublicMatch[];
  slug?: string;
  isLoading?: boolean;
  zagueiroId?: string | null;
  faltou?: Partial<Record<"atacante" | "meia" | "goleiro" | "zagueiro", boolean>> | null;
  onSelectZagueiro?: (athleteId: string) => void;
  onToggleAusencia?: (
    role: "atacante" | "meia" | "goleiro" | "zagueiro",
    athleteId: string,
    ausente: boolean
  ) => void;
};

type Jogador = { id: string; nome: string; apelido: string; pos: string; foto?: string | null };
type PlayerStat = {
  id: string;
  nome: string;
  apelido: string;
  pos: string;
  foto?: string | null;
  timeId?: string;
  goals: number;
  assists: number;
};
type RoleKey = "atacante" | "meia" | "goleiro" | "zagueiro";

export default function CardsDestaquesDiaV2({
  confrontos,
  times,
  matches,
  slug,
  isLoading,
  zagueiroId,
  faltou,
  onSelectZagueiro,
  onToggleAusencia,
}: Props) {
  const { tenantSlug } = useRacha();
  const [zagueiroSelecionado, setZagueiroSelecionado] = useState<string>("");
  const [faltouState, setFaltouState] = useState<Record<string, boolean>>({});

  const slugFinal = (slug ?? tenantSlug ?? "").trim();
  const shouldFetchMatches =
    Boolean(slugFinal) && !matches && (!confrontos || confrontos.length === 0);

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

  useEffect(() => {
    if (typeof zagueiroId === "string") {
      setZagueiroSelecionado(zagueiroId);
    } else {
      setZagueiroSelecionado("");
    }
  }, [zagueiroId]);

  useEffect(() => {
    if (!faltou) {
      setFaltouState({});
      return;
    }
    setFaltouState({ ...faltou });
  }, [faltou]);

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

  const stats = useMemo(() => {
    const map = new Map<string, PlayerStat>();
    const nameLookup = new Map<string, string>();

    baseTimes.forEach((team) => {
      (team.jogadores ?? []).forEach((jogador) => {
        const id = jogador.id || `${jogador.nome}-${team.id}`;
        if (!map.has(id)) {
          map.set(id, {
            id,
            nome: jogador.nome,
            apelido: jogador.apelido ?? "",
            pos: jogador.pos,
            foto: jogador.foto ?? null,
            timeId: team.id,
            goals: 0,
            assists: 0,
          });
        }
        const key = normalizeKey(jogador.nome);
        if (key && !nameLookup.has(key)) {
          nameLookup.set(key, id);
        }
      });
    });

    const incrementGoal = (id?: string, name?: string) => {
      const targetId = id || (name ? nameLookup.get(normalizeKey(name)) : null);
      if (!targetId) return;
      const entry = map.get(targetId);
      if (!entry) return;
      entry.goals += 1;
    };

    const incrementAssist = (id?: string, name?: string) => {
      const targetId = id || (name ? nameLookup.get(normalizeKey(name)) : null);
      if (!targetId) return;
      const entry = map.get(targetId);
      if (!entry) return;
      entry.assists += 1;
    };

    (eventosDia ?? []).forEach((event) => {
      if (event.jogadorId || (event.jogador && event.jogador !== "faltou")) {
        incrementGoal(event.jogadorId, event.jogador);
      }
      if (event.assistenciaId || (event.assistencia && event.assistencia !== "faltou")) {
        incrementAssist(event.assistenciaId, event.assistencia);
      }
    });

    return {
      list: Array.from(map.values()),
      map,
    };
  }, [baseTimes, eventosDia]);

  const championOrder = (timeCampeao?.jogadores ?? [])
    .map((jogador) => jogador.id)
    .filter((id): id is string => Boolean(id));

  const championStats = timeCampeao?.id
    ? stats.list.filter((player) => player.timeId === timeCampeao.id)
    : [];
  const atacantes = championStats.filter((player) => player.pos === "ATA");
  const meias = championStats.filter((player) => player.pos === "MEIA");
  const goleiros = championStats.filter((player) => player.pos === "GOL");
  const zagueiros = championStats.filter((player) => player.pos === "ZAG");

  const atacante = pickPlayer(atacantes, "goals", "assists", championOrder);
  const meia = pickPlayer(meias, "assists", "goals", championOrder);
  const goleiro = goleiros[0] ?? null;

  const artilheiro = pickPlayer(stats.list, "goals", "assists");
  const maestro = pickPlayer(stats.list, "assists", "goals");

  const golsAtacante = atacante?.goals ?? 0;
  const assistenciasMeia = meia?.assists ?? 0;

  const handleZagueiroChange = (value: string) => {
    setZagueiroSelecionado(value);
    onSelectZagueiro?.(value);
  };

  const loading = isLoading || (shouldFetchMatches && loadingMatches);
  const semDados = !loading && baseConfrontos.length === 0;

  const aguardando = (
    <div className="w-full text-center text-zinc-400 font-semibold py-8">
      {erroMatches
        ? "Não foi possível carregar os resultados do dia."
        : "Aguarde: resultados precisam ser lançados para exibir os destaques do dia."}
    </div>
  );

  function CardDestaque({
    titulo,
    nome = "",
    apelido = "",
    pos = "",
    foto = "",
    infoExtra = "",
    roleKey,
    athleteId,
    zagueiroManual,
    onZagueiroChange,
    options = [],
    selected = "",
  }: {
    titulo: string;
    nome?: string;
    apelido?: string;
    pos?: string;
    foto?: string;
    infoExtra?: string;
    roleKey?: RoleKey;
    athleteId?: string;
    zagueiroManual?: boolean;
    onZagueiroChange?: (value: string) => void;
    options?: Jogador[];
    selected?: string;
  }) {
    const isAbsent = roleKey ? Boolean(faltouState[roleKey]) : false;
    const canToggle = Boolean(roleKey && athleteId && onToggleAusencia);
    const botImage = roleKey === "goleiro" ? BOT_GOALKEEPER_IMAGE : BOT_PLAYER_IMAGE;
    const botLabel = roleKey === "goleiro" ? "Goleiro Reserva BOT" : "Jogador Reserva BOT";

    const handleToggle = (checked: boolean) => {
      if (!roleKey) return;
      setFaltouState((prev) => ({ ...prev, [roleKey]: checked }));
      if (canToggle && athleteId) {
        onToggleAusencia?.(roleKey, athleteId, checked);
      }
    };

    if (zagueiroManual) {
      const zagueiroSelecionadoInfo = options.find((jogador) => jogador.id === selected);
      if (isAbsent) {
        return (
          <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-between relative">
            <img
              src={botImage}
              alt={botLabel}
              className="w-20 h-20 rounded-full mb-2 object-cover border-4 border-yellow-400"
            />
            <div className="text-yellow-400 font-bold text-sm text-center mb-1 uppercase">
              {titulo}
            </div>
            <div className="text-white text-lg font-bold text-center">{botLabel}</div>
            <div className="text-yellow-200 text-xs">Ausente na rodada</div>
            <label className="flex items-center gap-1 mt-2 text-xs text-yellow-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isAbsent}
                onChange={(e) => handleToggle(e.target.checked)}
              />
              Jogador não compareceu ao racha
            </label>
            <div className="h-6"></div>
          </div>
        );
      }

      if (selected && zagueiroSelecionadoInfo) {
        return (
          <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-between relative">
            <img
              src={zagueiroSelecionadoInfo.foto || DEFAULT_PLAYER_IMAGE}
              alt={zagueiroSelecionadoInfo.nome}
              className="w-20 h-20 rounded-full mb-2 object-cover border-4 border-yellow-400"
            />
            <div className="text-yellow-400 font-bold text-sm text-center mb-1 uppercase">
              {titulo}
            </div>
            <div className="text-white text-lg font-bold text-center">
              {zagueiroSelecionadoInfo.nome}
            </div>
            <div className="text-yellow-200 text-xs">
              {zagueiroSelecionadoInfo.apelido}{" "}
              {zagueiroSelecionadoInfo.pos ? `| ${zagueiroSelecionadoInfo.pos}` : ""}
            </div>
            <label className="flex items-center gap-1 mt-2 text-xs text-yellow-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isAbsent}
                onChange={(e) => handleToggle(e.target.checked)}
              />
              Jogador não compareceu ao racha
            </label>
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
            {(options ?? []).map((jogador, idx) => (
              <option key={jogador.id || idx} value={jogador.id}>
                {jogador.nome} {jogador.apelido ? `(${jogador.apelido})` : ""}
              </option>
            ))}
          </select>
        </div>
      );
    }

    const displayFoto = isAbsent ? botImage : foto || DEFAULT_PLAYER_IMAGE;
    const displayNome = isAbsent ? botLabel : nome;
    const displayInfo = isAbsent ? "" : infoExtra;

    return (
      <div className="flex flex-col items-center bg-zinc-800 rounded-xl shadow-lg px-5 py-4 min-w-[185px] max-w-xs min-h-[260px] justify-between relative">
        <img
          src={displayFoto}
          alt={displayNome || titulo}
          className="w-20 h-20 rounded-full mb-2 object-cover border-4 border-yellow-400"
        />
        <div className="text-yellow-400 font-bold text-sm text-center mb-1 uppercase">{titulo}</div>
        {displayNome ? (
          <>
            <div className="text-white text-lg font-bold text-center">{displayNome}</div>
            {!isAbsent && (
              <div className="text-yellow-200 text-xs">
                {apelido ? apelido : ""} {pos ? `| ${pos}` : ""}
              </div>
            )}
            {displayInfo && (
              <div className="mt-1 text-yellow-400 text-sm font-bold">{displayInfo}</div>
            )}
            {roleKey && (
              <label className="flex items-center gap-1 mt-2 text-xs text-yellow-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAbsent}
                  onChange={(e) => handleToggle(e.target.checked)}
                  disabled={!canToggle}
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
          Referência: {new Date(dataReferencia).toLocaleDateString("pt-BR")}
        </span>
      )}
      <div className="flex flex-wrap gap-5 justify-center">
        <CardDestaque
          titulo="ATACANTE DO DIA"
          nome={atacante?.nome ?? ""}
          apelido={atacante?.apelido ?? ""}
          pos={atacante?.pos ?? ""}
          foto={atacante?.foto ?? ""}
          infoExtra={atacante?.nome ? `${golsAtacante} gols` : ""}
          roleKey="atacante"
          athleteId={atacante?.id}
        />
        <CardDestaque
          titulo="MEIA DO DIA"
          nome={meia?.nome ?? ""}
          apelido={meia?.apelido ?? ""}
          pos={meia?.pos ?? ""}
          foto={meia?.foto ?? ""}
          infoExtra={meia?.nome ? `${assistenciasMeia} assistências` : ""}
          roleKey="meia"
          athleteId={meia?.id}
        />
        <CardDestaque
          titulo="ZAGUEIRO DO DIA"
          zagueiroManual
          roleKey="zagueiro"
          athleteId={zagueiroSelecionado || undefined}
          options={Array.isArray(zagueiros) ? zagueiros : []}
          selected={zagueiroSelecionado ?? ""}
          onZagueiroChange={handleZagueiroChange}
        />
        <CardDestaque
          titulo="GOLEIRO DO DIA"
          nome={goleiro?.nome ?? ""}
          apelido={goleiro?.apelido ?? ""}
          pos={goleiro?.pos ?? ""}
          foto={goleiro?.foto ?? ""}
          roleKey="goleiro"
          athleteId={goleiro?.id}
        />
      </div>
      <div className="flex flex-wrap gap-5 justify-center mt-2">
        <CardDestaque
          titulo="TIME CAMPEÃO DO DIA"
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
          foto={artilheiro?.foto ?? ""}
          infoExtra={artilheiro?.goals ? `${artilheiro.goals} gols` : ""}
        />
        <CardDestaque
          titulo="MAESTRO DO DIA"
          nome={maestro?.nome ?? ""}
          apelido=""
          foto={maestro?.foto ?? ""}
          infoExtra={maestro?.assists ? `${maestro.assists} assistências` : ""}
        />
      </div>
      {(eventosDia?.length ?? 0) === 0 && aguardando}
    </div>
  );
}

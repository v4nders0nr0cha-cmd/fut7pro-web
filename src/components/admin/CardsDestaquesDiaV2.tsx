"use client";
import { useEffect, useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import {
  buildDestaquesDoDia,
  getEventosDoDia,
  getTimeCampeao,
  type ConfrontoV2,
  type TimeDestaque,
  type EventoGolV2,
} from "@/utils/destaquesDoDia";
import type { PublicMatch } from "@/types/partida";
import type { DestaqueDiaFaltou } from "@/types/destaques";

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

function plural(value: number, singular: string, pluralLabel: string) {
  return `${value} ${value === 1 ? singular : pluralLabel}`;
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
  faltou?: DestaqueDiaFaltou | null;
  ausenciaTargets?: Partial<Record<"atacante" | "meia" | "goleiro" | "zagueiro", string>>;
  onSelectZagueiro?: (athleteId: string) => void;
  onToggleAusencia?: (
    role: "atacante" | "meia" | "goleiro" | "zagueiro",
    athleteId: string,
    ausente: boolean
  ) => void | Promise<void>;
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
  ausenciaTargets,
  onSelectZagueiro,
  onToggleAusencia,
}: Props) {
  const { tenantSlug } = useRacha();
  const [zagueiroSelecionado, setZagueiroSelecionado] = useState<string>("");
  const [faltouState, setFaltouState] = useState<Partial<Record<RoleKey, boolean>>>({});
  const [pendingRole, setPendingRole] = useState<RoleKey | null>(null);

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
    setFaltouState({
      atacante: Boolean(faltou.atacante),
      meia: Boolean(faltou.meia),
      goleiro: Boolean(faltou.goleiro),
      zagueiro: Boolean(faltou.zagueiro),
    });
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
    const persistedAbsenceTargetId = roleKey ? faltou?.targets?.[roleKey]?.athleteId : undefined;
    const absenceTargetId = roleKey
      ? (ausenciaTargets?.[roleKey] ?? persistedAbsenceTargetId)
      : undefined;
    const toggleAthleteId = isAbsent ? absenceTargetId : athleteId;
    const canToggle = Boolean(roleKey && toggleAthleteId && onToggleAusencia);
    const isPending = Boolean(roleKey && pendingRole === roleKey);
    const botImage = roleKey === "goleiro" ? BOT_GOALKEEPER_IMAGE : BOT_PLAYER_IMAGE;
    const botLabel = roleKey === "goleiro" ? "Goleiro Reserva BOT" : "Jogador Reserva BOT";

    const handleToggle = async (checked: boolean) => {
      if (!roleKey || !canToggle || !toggleAthleteId || isPending) return;
      setPendingRole(roleKey);
      try {
        await onToggleAusencia?.(roleKey, toggleAthleteId, checked);
        setFaltouState((prev) => ({ ...prev, [roleKey]: checked }));
      } finally {
        setPendingRole(null);
      }
    };

    if (zagueiroManual) {
      const zagueiroSelecionadoInfo = options.find((jogador) => jogador.id === selected);
      if (isAbsent || (selected && zagueiroSelecionadoInfo)) {
        const displayFoto = isAbsent
          ? botImage
          : zagueiroSelecionadoInfo?.foto || DEFAULT_PLAYER_IMAGE;
        const displayNome = isAbsent ? botLabel : zagueiroSelecionadoInfo?.nome || "";
        const displayInfo = isAbsent
          ? "Ausente na rodada"
          : [zagueiroSelecionadoInfo?.apelido, zagueiroSelecionadoInfo?.pos]
              .filter(Boolean)
              .join(" · ");

        return (
          <div className="flex min-h-[176px] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 shadow-lg sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-yellow-300">
                  {titulo}
                </div>
                <span className="mt-2 inline-flex rounded-full bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-300">
                  Manual
                </span>
              </div>
              <img
                src={displayFoto}
                alt={displayNome || titulo}
                className="h-14 w-14 rounded-full border-2 border-yellow-400/70 object-cover"
              />
            </div>
            <div className="mt-3 min-w-0 flex-1">
              <div className="text-base font-bold leading-snug text-white sm:text-lg">
                {displayNome}
              </div>
              {displayInfo && <div className="mt-1 text-sm text-yellow-100">{displayInfo}</div>}
            </div>
            {canToggle && (
              <button
                type="button"
                className="mt-2 self-start text-xs font-semibold text-yellow-300 hover:text-yellow-200 disabled:text-zinc-500"
                onClick={() => handleToggle(!isAbsent)}
                disabled={isPending}
              >
                {isAbsent ? "Restaurar presença" : "Marcar como ausente"}
              </button>
            )}
          </div>
        );
      }

      return (
        <div className="flex min-h-[176px] flex-col justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 shadow-lg sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-yellow-300">
              {titulo}
            </div>
            <span className="rounded-full bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-300">
              Manual
            </span>
          </div>
          <select
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-yellow-100"
            value={selected}
            onChange={(e) => onZagueiroChange?.(e.target.value)}
          >
            <option value="">Selecione o zagueiro</option>
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
      <div className="flex min-h-[176px] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 shadow-lg sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-yellow-300">
              {titulo}
            </div>
            {roleKey && (
              <span className="mt-2 inline-flex rounded-full bg-green-400/10 px-2 py-1 text-[11px] font-semibold text-green-200">
                Automático
              </span>
            )}
          </div>
          <img
            src={displayFoto}
            alt={displayNome || titulo}
            className="h-14 w-14 rounded-full border-2 border-yellow-400/70 object-cover"
          />
        </div>
        {displayNome ? (
          <>
            <div className="mt-3 text-base font-bold leading-snug text-white sm:text-lg">
              {displayNome}
            </div>
            {!isAbsent && (
              <div className="mt-1 text-sm text-yellow-100">
                {[apelido, pos].filter(Boolean).join(" · ")}
              </div>
            )}
            {displayInfo && (
              <div className="mt-2 text-sm font-bold text-yellow-300">{displayInfo}</div>
            )}
            {roleKey && canToggle && (
              <button
                type="button"
                className="mt-auto pt-3 text-left text-xs font-semibold text-yellow-300 hover:text-yellow-200 disabled:text-zinc-500"
                onClick={() => handleToggle(!isAbsent)}
                disabled={!canToggle || isPending}
              >
                {isAbsent ? "Restaurar presença" : "Marcar como ausente"}
              </button>
            )}
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
    <div className="w-full flex flex-col gap-5">
      {dataReferencia && (
        <span className="self-start text-xs uppercase tracking-wide text-yellow-400">
          Referência: {new Date(dataReferencia).toLocaleDateString("pt-BR")}
        </span>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardDestaque
          titulo="ATACANTE DO DIA"
          nome={atacante?.nome ?? ""}
          apelido={atacante?.apelido ?? ""}
          pos={atacante?.pos ?? ""}
          foto={atacante?.foto ?? ""}
          infoExtra={atacante?.nome ? plural(golsAtacante, "gol", "gols") : ""}
          roleKey="atacante"
          athleteId={atacante?.id}
        />
        <CardDestaque
          titulo="MEIA DO DIA"
          nome={meia?.nome ?? ""}
          apelido={meia?.apelido ?? ""}
          pos={meia?.pos ?? ""}
          foto={meia?.foto ?? ""}
          infoExtra={meia?.nome ? plural(assistenciasMeia, "assistência", "assistências") : ""}
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <CardDestaque
          titulo="ARTILHEIRO DO DIA"
          nome={artilheiro?.nome ?? ""}
          apelido=""
          foto={artilheiro?.foto ?? ""}
          infoExtra={artilheiro?.goals ? plural(artilheiro.goals, "gol", "gols") : ""}
        />
        <CardDestaque
          titulo="MAESTRO DO DIA"
          nome={maestro?.nome ?? ""}
          apelido=""
          foto={maestro?.foto ?? ""}
          infoExtra={maestro?.assists ? plural(maestro.assists, "assistência", "assistências") : ""}
        />
      </div>
      {(eventosDia?.length ?? 0) === 0 && aguardando}
    </div>
  );
}

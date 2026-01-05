"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { useMe } from "@/hooks/useMe";
import { useTimes } from "@/hooks/useTimes";
import { useJogadores } from "@/hooks/useJogadores";
import type { Jogador } from "@/types/jogador";
import type { Time } from "@/types/time";

const RESULTS_ROUTE = "/admin/partidas/resultados-do-dia";

type MatchDraft = {
  id: string;
  teamAId: string;
  teamBId: string;
  playersA: string[];
  playersB: string[];
};

type PlayerOption = {
  id: string;
  label: string;
  name: string;
};

function createDraftId() {
  return `draft-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function buildIsoDate(dateValue: string, timeValue: string) {
  if (!dateValue) return null;
  const time = timeValue || "00:00";
  const iso = `${dateValue}T${time}:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function getPlayerLabel(player: Jogador) {
  const apelido = player.apelido || player.nickname;
  if (apelido) return `${player.nome} (${apelido})`;
  return player.nome || "Atleta";
}

export default function PartidaClassicaPage() {
  const router = useRouter();
  const { me } = useMe();
  const tenantId = me?.tenant?.tenantId ?? "";
  const tenantSlug = me?.tenant?.tenantSlug ?? undefined;
  const { times, isLoading: timesLoading } = useTimes(tenantSlug);
  const { jogadores, isLoading: jogadoresLoading } = useJogadores(tenantId, {
    includeBots: true,
  });

  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [location, setLocation] = useState("");
  const [matches, setMatches] = useState<MatchDraft[]>([]);
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const playerOptions = useMemo<PlayerOption[]>(() => {
    return (jogadores || [])
      .map((player) => ({
        id: player.id,
        label: getPlayerLabel(player),
        name: player.nome || player.name || "Atleta",
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [jogadores]);

  const playerLabelById = useMemo(() => {
    const map = new Map<string, string>();
    playerOptions.forEach((player) => map.set(player.id, player.label));
    return map;
  }, [playerOptions]);

  const resultsUrl = dateValue ? `${RESULTS_ROUTE}?date=${dateValue}` : RESULTS_ROUTE;

  const addMatch = () => {
    setMatches((prev) => [
      ...prev,
      { id: createDraftId(), teamAId: "", teamBId: "", playersA: [], playersB: [] },
    ]);
  };

  const removeMatch = (id: string) => {
    setMatches((prev) => prev.filter((match) => match.id !== id));
    setSearchMap((prev) => {
      const updated = { ...prev };
      delete updated[`${id}-A`];
      delete updated[`${id}-B`];
      return updated;
    });
  };

  const updateMatch = (id: string, updates: Partial<MatchDraft>) => {
    setMatches((prev) => prev.map((match) => (match.id === id ? { ...match, ...updates } : match)));
  };

  const togglePlayer = (matchId: string, side: "A" | "B", playerId: string) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id !== matchId) return match;
        const key = side === "A" ? "playersA" : "playersB";
        const list = match[key];
        const exists = list.includes(playerId);
        const nextList = exists ? list.filter((item) => item !== playerId) : [...list, playerId];
        return { ...match, [key]: nextList } as MatchDraft;
      })
    );
  };

  const updateTeam = (matchId: string, side: "A" | "B", teamId: string) => {
    if (side === "A") {
      updateMatch(matchId, { teamAId: teamId, playersA: [] });
    } else {
      updateMatch(matchId, { teamBId: teamId, playersB: [] });
    }
  };

  const updateSearch = (matchId: string, side: "A" | "B", value: string) => {
    setSearchMap((prev) => ({ ...prev, [`${matchId}-${side}`]: value }));
  };

  const validateMatches = () => {
    if (!dateValue) return "Informe a data da rodada.";
    if (!matches.length) return "Adicione pelo menos uma partida.";
    if (!tenantId) return "Nao foi possivel identificar o racha logado.";

    for (let i = 0; i < matches.length; i += 1) {
      const match = matches[i];
      if (!match.teamAId || !match.teamBId) {
        return `Selecione os times da partida ${i + 1}.`;
      }
      if (match.teamAId === match.teamBId) {
        return `Os times da partida ${i + 1} nao podem ser iguais.`;
      }
      if (!match.playersA.length || !match.playersB.length) {
        return `Selecione os atletas das duas equipes na partida ${i + 1}.`;
      }
      const overlap = match.playersA.filter((id) => match.playersB.includes(id));
      if (overlap.length) {
        return `Ha atletas duplicados nas equipes da partida ${i + 1}.`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateMatches();
    if (validationError) {
      setError(validationError);
      return;
    }

    const isoDate = buildIsoDate(dateValue, timeValue);
    if (!isoDate) {
      setError("Data ou horario invalido.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      for (const draft of matches) {
        const payload: Record<string, unknown> = {
          date: isoDate,
          teamAId: draft.teamAId,
          teamBId: draft.teamBId,
        };
        if (location.trim()) payload.location = location.trim();

        const response = await fetch("/api/partidas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Falha ao criar partida classica");
        }

        const createdMatch = (await response.json()) as { id?: string };
        if (!createdMatch?.id) {
          throw new Error("Resposta invalida ao criar partida classica");
        }

        const presences = [
          ...draft.playersA.map((athleteId) => ({
            athleteId,
            teamId: draft.teamAId,
            goals: 0,
            assists: 0,
            status: "TITULAR",
          })),
          ...draft.playersB.map((athleteId) => ({
            athleteId,
            teamId: draft.teamBId,
            goals: 0,
            assists: 0,
            status: "TITULAR",
          })),
        ];

        if (presences.length) {
          const updateResponse = await fetch(`/api/partidas/${createdMatch.id}/resultado`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ presences }),
          });

          if (!updateResponse.ok) {
            const body = await updateResponse.text();
            throw new Error(body || "Falha ao registrar presencas da partida");
          }
        }
      }

      setSuccess(true);
      setMatches([]);
      setSearchMap({});
      setTimeout(() => {
        router.push(resultsUrl);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar partidas");
    } finally {
      setIsSaving(false);
    }
  };

  const renderTeamSelect = (match: MatchDraft, side: "A" | "B") => {
    const selectedId = side === "A" ? match.teamAId : match.teamBId;
    return (
      <select
        value={selectedId}
        onChange={(e) => updateTeam(match.id, side, e.target.value)}
        className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
      >
        <option value="">Selecione o time {side}</option>
        {times.map((time) => (
          <option key={time.id} value={time.id}>
            {time.nome}
          </option>
        ))}
      </select>
    );
  };

  const renderRoster = (match: MatchDraft, side: "A" | "B", team: Time | undefined) => {
    const selected = side === "A" ? match.playersA : match.playersB;
    const blocked = new Set(side === "A" ? match.playersB : match.playersA);
    const searchKey = `${match.id}-${side}`;
    const query = (searchMap[searchKey] || "").trim().toLowerCase();
    const filteredPlayers = playerOptions.filter((player) =>
      query ? player.label.toLowerCase().includes(query) : true
    );

    return (
      <div className="mt-3 rounded-xl border border-neutral-800 bg-[#151515] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-neutral-300">Atletas do {team?.nome || `Time ${side}`}</p>
          <span className="text-[11px] text-neutral-400">{selected.length} selecionados</span>
        </div>
        <input
          value={searchMap[searchKey] || ""}
          onChange={(e) => updateSearch(match.id, side, e.target.value)}
          placeholder="Buscar atleta"
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-xs text-neutral-100"
        />
        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <p className="text-xs text-neutral-500">Nenhum atleta encontrado.</p>
          ) : (
            filteredPlayers.map((player) => {
              const checked = selected.includes(player.id);
              const disabled = blocked.has(player.id);
              return (
                <label key={player.id} className="flex items-center gap-2 text-sm text-neutral-200">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlayer(match.id, side, player.id)}
                    disabled={disabled}
                  />
                  <span className={disabled ? "opacity-50" : ""}>{player.label}</span>
                </label>
              );
            })
          )}
        </div>
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((playerId) => (
              <span
                key={playerId}
                className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-200"
              >
                {playerLabelById.get(playerId) || "Atleta"}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Partida Classica | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Cadastre partidas classicas com times reais e escalacoes completas. Lance resultados depois no Resultados do Dia do Fut7Pro."
        />
        <meta
          name="keywords"
          content="partida classica, cadastro manual, times, atletas, painel admin, fut7pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white px-4 pt-[64px] md:pt-[80px] pb-24 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 mb-8">
            <h1 className="text-3xl font-bold text-yellow-400">Partida Classica</h1>
            <p className="text-sm text-neutral-300 max-w-3xl">
              Cadastre partidas avulsas ou retroativas com times reais, selecione os atletas que
              participaram e deixe tudo pronto para lancar resultados no painel. Essas partidas
              aparecem automaticamente no Resultados do Dia e no historico publico.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6">
              <h2 className="text-lg font-semibold text-yellow-300 mb-4">Dados da rodada</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-400 flex items-center gap-2">
                    <FaCalendarAlt /> Data
                  </label>
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-400 flex items-center gap-2">
                    <FaClock /> Horario (opcional)
                  </label>
                  <input
                    type="time"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-400 flex items-center gap-2">
                    <FaMapMarkerAlt /> Local (opcional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Arena principal"
                    className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={addMatch}
                  className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
                >
                  <FaPlus /> Adicionar partida
                </button>
                <span className="text-xs text-neutral-400">
                  {matches.length} partidas adicionadas
                </span>
              </div>

              {timesLoading || jogadoresLoading ? (
                <div className="mt-6 rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4 text-sm text-neutral-300">
                  Carregando times e atletas...
                </div>
              ) : times.length === 0 ? (
                <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                  Nenhum time cadastrado. Cadastre os times antes de criar partidas classicas.
                </div>
              ) : jogadores.length === 0 ? (
                <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                  Nenhum atleta cadastrado. Cadastre atletas antes de montar partidas classicas.
                </div>
              ) : null}

              <div className="mt-6 space-y-5">
                {matches.map((match, index) => {
                  const teamA = times.find((time) => time.id === match.teamAId);
                  const teamB = times.find((time) => time.id === match.teamBId);

                  return (
                    <div
                      key={match.id}
                      className="rounded-2xl border border-neutral-800 bg-[#101010] p-5"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-neutral-300">
                            <FaUsers className="text-yellow-400" /> Partida {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMatch(match.id)}
                            className="text-xs text-red-200 hover:text-red-300"
                          >
                            <FaTrash /> Remover
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-neutral-400 mb-2 block">Time A</label>
                            {renderTeamSelect(match, "A")}
                            {renderRoster(match, "A", teamA)}
                          </div>
                          <div>
                            <label className="text-xs text-neutral-400 mb-2 block">Time B</label>
                            {renderTeamSelect(match, "B")}
                            {renderRoster(match, "B", teamB)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-neutral-800 bg-[#151515] p-6">
                <h2 className="text-lg font-semibold text-yellow-300 mb-3">Checklist rapido</h2>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>Escolha a data da rodada e adicione as partidas.</li>
                  <li>Defina os times e selecione os atletas de cada equipe.</li>
                  <li>Salve para liberar o lancamento de resultados no Resultados do Dia.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-[#151515] p-6">
                <h2 className="text-lg font-semibold text-yellow-300 mb-3">Salvar partidas</h2>
                <p className="text-sm text-neutral-300 mb-4">
                  As partidas classicas serao enviadas para o backend e aparecerem no site publico
                  quando forem finalizadas.
                </p>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {isSaving ? "Salvando partidas..." : "Salvar e ir para Resultados do Dia"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(resultsUrl)}
                  className="mt-3 w-full rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
                >
                  Abrir Resultados do Dia
                </button>
              </div>
            </aside>
          </div>
        </div>

        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="rounded-2xl border border-green-500/40 bg-[#101010] p-6 text-center shadow-xl">
              <FaCheckCircle className="mx-auto mb-3 text-4xl text-green-400" />
              <h2 className="text-xl font-semibold text-green-300 mb-2">
                Partidas salvas com sucesso!
              </h2>
              <p className="text-sm text-neutral-300">Redirecionando para o Resultados do Dia...</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

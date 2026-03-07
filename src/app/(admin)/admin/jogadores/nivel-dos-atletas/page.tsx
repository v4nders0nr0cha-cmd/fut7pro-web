"use client";

import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaHistory, FaFilter, FaCheckCircle, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRacha } from "@/context/RachaContext";
import { useJogadores } from "@/hooks/useJogadores";
import { useMe } from "@/hooks/useMe";
import { useNiveisAtletas } from "@/hooks/useNiveisAtletas";
import EditorEstrelas from "@/components/sorteio/EditorEstrelas";
import StarRatingDisplay from "@/components/ui/StarRatingDisplay";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import { calcularNivelFinal, formatNivel } from "@/utils/nivel-atleta";
import type { Jogador } from "@/types/jogador";

export const dynamic = "force-dynamic";

type HistoricoNivel = {
  id: string;
  habilidade: number | null;
  fisico: number | null;
  nivelFinal: number | null;
  atualizadoEm: string;
  atualizadoPorNome?: string | null;
};

type EditState = {
  habilidade?: number | null;
  fisico?: number | null;
};

type SaveStatus = "saved" | "error";

type SaveOverlayState = {
  athleteId: string;
  athleteName: string;
};

type AtletaNivel = {
  jogador: Jogador;
  posicao: string;
  habilidadeSalva: number | null;
  fisicoSalva: number | null;
  habilidade: number | null;
  fisico: number | null;
  nivelFinal: number | null;
  nivelOrdenacao: number | null;
  atualizadoEm: string | null;
  atualizadoPorNome: string | null;
  mensalista: boolean;
};

const ROLES_PODEM_EDITAR = ["PRESIDENTE", "VICE_PRESIDENTE", "DIRETOR_FUTEBOL"];
const POSICOES = ["GOL", "ZAG", "MEI", "ATA"];

function normalizarPosicao(posicao?: string | null) {
  const value = String(posicao || "").toLowerCase();
  if (value.startsWith("gol")) return "GOL";
  if (value.startsWith("zag")) return "ZAG";
  if (value.startsWith("mei")) return "MEI";
  if (value.startsWith("ata")) return "ATA";
  return value ? value.toUpperCase() : "MEI";
}

function formatarDataHora(valor?: string | null) {
  if (!valor) return "-";
  const date = new Date(valor);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function ModalHistorico({
  open,
  atleta,
  onClose,
}: {
  open: boolean;
  atleta: Jogador | null;
  onClose: () => void;
}) {
  const [historico, setHistorico] = useState<HistoricoNivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !atleta?.id) return;

    setLoading(true);
    setError(null);
    fetch(`/api/estrelas/historico?athleteId=${encodeURIComponent(atleta.id)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Erro ao carregar histórico");
        }
        return res.json();
      })
      .then((data: HistoricoNivel[]) => setHistorico(Array.isArray(data) ? data : []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, atleta?.id]);

  if (!open || !atleta) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
      <div className="bg-[#151515] border border-yellow-500/30 rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-yellow-400">Histórico de alterações</h2>
            <p className="text-xs text-gray-300">{atleta.nome || "Atleta"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-sm font-semibold px-3 py-1 rounded bg-[#232323]"
          >
            Fechar
          </button>
        </div>

        {loading && <div className="text-sm text-gray-300">Carregando histórico...</div>}
        {error && <div className="text-sm text-red-300">{error}</div>}

        {!loading && !error && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {historico.length === 0 && (
              <div className="text-sm text-gray-400">Nenhuma alteração registrada.</div>
            )}
            {historico.map((item) => (
              <div key={item.id} className="border border-zinc-800 rounded-lg p-3 bg-[#1f1f1f]">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatarDataHora(item.atualizadoEm)}</span>
                  <span>{item.atualizadoPorNome || "Admin"}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-200">
                  <div>
                    <span className="block text-gray-500">Habilidade</span>
                    <span className="font-semibold">{item.habilidade ?? "-"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Físico</span>
                    <span className="font-semibold">{item.fisico ?? "-"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Nível</span>
                    <span className="font-semibold">{formatNivel(item.nivelFinal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModalSalvamento({ saving }: { saving: SaveOverlayState | null }) {
  if (!saving) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-[2px] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-yellow-500/30 bg-[#121212]/95 p-6 shadow-[0_24px_80px_-28px_rgba(251,191,36,0.45)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-500/10">
          <span className="h-7 w-7 rounded-full border-2 border-yellow-400/30 border-t-yellow-300 animate-spin" />
        </div>
        <h3 className="text-center text-base font-semibold text-yellow-200">
          Atualizando a avaliação de {saving.athleteName || "atleta"}...
        </h3>
        <p className="mt-2 text-center text-sm text-zinc-300">
          Aguarde um instante para concluir o salvamento com segurança.
        </p>
      </div>
    </div>
  );
}

function NivelAtletasSkeleton() {
  return (
    <div className="mt-4 space-y-4 animate-pulse">
      <div className="rounded-xl border border-zinc-800 bg-[#202020] p-3">
        <div className="h-4 w-40 rounded bg-zinc-700/70" />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="h-10 rounded-lg bg-zinc-800/80" />
          <div className="h-10 rounded-lg bg-zinc-800/80" />
          <div className="h-10 rounded-lg bg-zinc-800/80" />
          <div className="h-10 rounded-lg bg-zinc-800/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-card-${index + 1}`}
            className="rounded-xl border border-zinc-800 bg-[#232323] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-zinc-700/70" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-700/70" />
                <div className="h-3 w-1/2 rounded bg-zinc-800/80" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded bg-zinc-800/80" />
              <div className="h-4 w-full rounded bg-zinc-800/80" />
              <div className="h-4 w-2/3 rounded bg-zinc-700/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NivelDosAtletasPage() {
  const { rachaId } = useRacha();
  const { me } = useMe();
  const { jogadores, isLoading: loadingJogadores } = useJogadores(rachaId);
  const {
    niveis,
    isLoading: loadingNiveis,
    atualizarNivel,
    revalidarNiveis,
  } = useNiveisAtletas(rachaId);

  const [busca, setBusca] = useState("");
  const [posicao, setPosicao] = useState("todas");
  const [apenasMensalistas, setApenasMensalistas] = useState(false);
  const [semNivel, setSemNivel] = useState(false);
  const [ordenacao, setOrdenacao] = useState("nivel");

  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [statusById, setStatusById] = useState<Record<string, SaveStatus>>({});
  const statusTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [activeSave, setActiveSave] = useState<SaveOverlayState | null>(null);
  const lastPayloadByAthleteRef = useRef<Record<string, string>>({});

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bulkHabilidade, setBulkHabilidade] = useState("");
  const [bulkFisico, setBulkFisico] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [historicoAtleta, setHistoricoAtleta] = useState<Jogador | null>(null);

  const role = (me?.membership?.role || "").toUpperCase();
  const canEdit = ROLES_PODEM_EDITAR.includes(role);
  const isUiLocked = bulkLoading || Boolean(activeSave);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const jogadoresMap = useMemo(() => {
    const map: Record<string, Jogador> = {};
    (jogadores || []).forEach((jogador) => {
      map[jogador.id] = jogador;
    });
    return map;
  }, [jogadores]);

  const niveisMap = useMemo(() => {
    const map: Record<string, (typeof niveis)[number]> = {};
    (niveis || []).forEach((nivel) => {
      map[nivel.jogadorId] = nivel;
    });
    return map;
  }, [niveis]);

  useEffect(() => {
    const statusTimers = statusTimersRef.current;
    return () => {
      Object.values(statusTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const atletas = useMemo<AtletaNivel[]>(() => {
    return (jogadores || []).map((jogador) => {
      const nivel = niveisMap[jogador.id];
      const habilidadeSalva = typeof nivel?.habilidade === "number" ? nivel.habilidade : null;
      const fisicoSalva = typeof nivel?.fisico === "number" ? nivel.fisico : null;
      const edit = edits[jogador.id] || {};
      const habilidade = edit.habilidade ?? nivel?.habilidade ?? null;
      const fisico = edit.fisico ?? nivel?.fisico ?? null;
      const nivelFinal = calcularNivelFinal(habilidade, fisico);
      const nivelOrdenacao =
        typeof nivel?.nivelFinal === "number"
          ? nivel?.nivelFinal
          : typeof habilidadeSalva === "number" && typeof fisicoSalva === "number"
            ? calcularNivelFinal(habilidadeSalva, fisicoSalva)
            : null;
      return {
        jogador,
        posicao: normalizarPosicao(jogador.posicao),
        habilidadeSalva,
        fisicoSalva,
        habilidade,
        fisico,
        nivelFinal,
        nivelOrdenacao,
        atualizadoEm: nivel?.atualizadoEm ?? null,
        atualizadoPorNome: nivel?.atualizadoPorNome ?? null,
        mensalista: Boolean(jogador.mensalista),
      };
    });
  }, [jogadores, niveisMap, edits]);

  const atletasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    let lista = atletas.filter((item) => {
      if (termo) {
        const nome = (item.jogador.nome || "").toLowerCase();
        const apelido = (item.jogador.apelido || "").toLowerCase();
        if (!nome.includes(termo) && !apelido.includes(termo)) return false;
      }
      if (posicao !== "todas" && item.posicao !== posicao) return false;
      if (apenasMensalistas && !item.mensalista) return false;
      if (semNivel && typeof item.habilidadeSalva !== "number") return false;
      return true;
    });

    const baseIndexMap = new Map<string, number>();
    atletas.forEach((item, index) => {
      baseIndexMap.set(item.jogador.id, index);
    });
    const baseIndex = (item: AtletaNivel) => baseIndexMap.get(item.jogador.id) ?? 0;
    const compareText = (a: string, b: string) => a.localeCompare(b);

    switch (ordenacao) {
      case "nome":
        lista = [...lista].sort((a, b) => {
          const diff = compareText(a.jogador.nome || "", b.jogador.nome || "");
          return diff !== 0 ? diff : baseIndex(a) - baseIndex(b);
        });
        break;
      case "posicao":
        lista = [...lista].sort((a, b) => {
          const diff = compareText(a.posicao, b.posicao);
          return diff !== 0 ? diff : baseIndex(a) - baseIndex(b);
        });
        break;
      case "habilidade":
        lista = [...lista].sort((a, b) => {
          const diff = (b.habilidadeSalva ?? -1) - (a.habilidadeSalva ?? -1);
          return diff !== 0 ? diff : baseIndex(a) - baseIndex(b);
        });
        break;
      case "fisico":
        lista = [...lista].sort((a, b) => {
          const diff = (b.fisicoSalva ?? -1) - (a.fisicoSalva ?? -1);
          return diff !== 0 ? diff : baseIndex(a) - baseIndex(b);
        });
        break;
      case "atualizado":
        lista = [...lista].sort((a, b) => {
          const dataA = a.atualizadoEm ? new Date(a.atualizadoEm).getTime() : 0;
          const dataB = b.atualizadoEm ? new Date(b.atualizadoEm).getTime() : 0;
          const diff = dataB - dataA;
          return diff !== 0 ? diff : baseIndex(a) - baseIndex(b);
        });
        break;
      default:
        lista = [...lista].sort((a, b) => {
          const diff = (b.nivelOrdenacao ?? -1) - (a.nivelOrdenacao ?? -1);
          return diff !== 0 ? diff : baseIndex(a) - baseIndex(b);
        });
    }

    return lista;
  }, [atletas, busca, posicao, apenasMensalistas, semNivel, ordenacao]);

  const selectedList = useMemo(
    () => Object.keys(selectedIds).filter((id) => selectedIds[id]),
    [selectedIds]
  );

  const isInitialLoading = (loadingJogadores || loadingNiveis) && atletas.length === 0;

  useEffect(() => {
    if (!isInitialLoading) {
      setShowSkeleton(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowSkeleton(true);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [isInitialLoading]);

  const setStatus = (id: string, status: SaveStatus, ttlMs = 2800) => {
    if (statusTimersRef.current[id]) {
      clearTimeout(statusTimersRef.current[id]);
    }
    setStatusById((prev) => ({ ...prev, [id]: status }));
    statusTimersRef.current[id] = setTimeout(() => {
      setStatusById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, ttlMs);
  };

  const limparEdicao = (id: string) => {
    setEdits((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const salvarAtleta = async (
    athleteId: string,
    habilidade: number,
    fisico: number,
    options?: { silentError?: boolean }
  ) => {
    const jogador = jogadoresMap[athleteId];
    const athleteName = jogador?.nome || "atleta";
    const nivelAtual = niveisMap[athleteId];
    const habilidadeSalva =
      typeof nivelAtual?.habilidade === "number" ? nivelAtual.habilidade : null;
    const fisicoSalvo = typeof nivelAtual?.fisico === "number" ? nivelAtual.fisico : null;

    if (habilidadeSalva === habilidade && fisicoSalvo === fisico) {
      limparEdicao(athleteId);
      setStatus(athleteId, "saved");
      return true;
    }

    const payloadKey = `${habilidade}:${fisico}`;
    if (lastPayloadByAthleteRef.current[athleteId] === payloadKey) {
      return true;
    }
    lastPayloadByAthleteRef.current[athleteId] = payloadKey;

    setActiveSave({ athleteId, athleteName });
    const result = await atualizarNivel({ athleteId, habilidade, fisico });
    setActiveSave(null);

    if (result.ok) {
      limparEdicao(athleteId);
      setStatus(athleteId, "saved");
      await revalidarNiveis().catch(() => {
        // Mantém o valor confirmado no POST se a revalidação falhar.
      });
      return true;
    }

    limparEdicao(athleteId);
    delete lastPayloadByAthleteRef.current[athleteId];
    setStatus(athleteId, "error", 3600);

    if (!options?.silentError) {
      const fallbackMessage = "Não foi possível salvar a avaliação deste atleta. Tente novamente.";
      const isRateLimitError = "error" in result && result.error.isRateLimit;
      const message = isRateLimitError
        ? "Muitas tentativas em sequência. Aguarde alguns segundos e tente novamente."
        : fallbackMessage;
      toast.error(message);
    }

    return false;
  };

  const handleHabilidadeChange = async (id: string, value: number) => {
    if (!canEdit || isUiLocked) return;
    const base = niveisMap[id];
    const prev = edits[id] || {};
    const fisicoAtual = prev.fisico ?? base?.fisico ?? null;

    setEdits((current) => ({
      ...current,
      [id]: { ...current[id], habilidade: value },
    }));

    if (typeof fisicoAtual === "number") {
      await salvarAtleta(id, value, fisicoAtual);
    }
  };

  const handleFisicoChange = async (id: string, value: number) => {
    if (!canEdit || isUiLocked) return;
    const base = niveisMap[id];
    const prev = edits[id] || {};
    const habilidadeAtual = prev.habilidade ?? base?.habilidade ?? null;

    setEdits((current) => ({
      ...current,
      [id]: { ...current[id], fisico: value },
    }));

    if (typeof habilidadeAtual === "number") {
      await salvarAtleta(id, habilidadeAtual, value);
    }
  };

  const toggleSelecionado = (id: string) => {
    if (!canEdit || isUiLocked) return;
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selecionarTodos = () => {
    if (!canEdit || isUiLocked) return;
    const next: Record<string, boolean> = {};
    atletasFiltrados.forEach((item) => {
      next[item.jogador.id] = true;
    });
    setSelectedIds(next);
  };

  const limparSelecao = () => {
    if (isUiLocked) return;
    setSelectedIds({});
  };

  const abrirHistorico = (atleta: Jogador) => {
    if (isUiLocked) return;
    setHistoricoAtleta(atleta);
    setHistoricoOpen(true);
  };

  const aplicarEdicaoLote = async () => {
    if (!canEdit || isUiLocked) return;
    if (selectedList.length === 0) {
      toast.error("Selecione ao menos um atleta.");
      return;
    }

    const habilidadeValor = bulkHabilidade ? Number(bulkHabilidade) : null;
    const fisicoValor = bulkFisico ? Number(bulkFisico) : null;

    if (habilidadeValor === null && fisicoValor === null) {
      toast.error("Defina habilidade e/ou físico para aplicar.");
      return;
    }

    setBulkLoading(true);
    let atualizados = 0;
    let falhas = 0;

    for (const id of selectedList) {
      const base = niveisMap[id];
      const prev = edits[id] || {};
      const habilidadeAtual = prev.habilidade ?? base?.habilidade ?? null;
      const fisicoAtual = prev.fisico ?? base?.fisico ?? null;
      const habilidade = habilidadeValor ?? habilidadeAtual;
      const fisico = fisicoValor ?? fisicoAtual;

      if (typeof habilidade !== "number" || typeof fisico !== "number") {
        falhas += 1;
        continue;
      }

      setEdits((current) => ({
        ...current,
        [id]: { habilidade, fisico },
      }));

      const ok = await salvarAtleta(id, habilidade, fisico, { silentError: true });
      if (ok) {
        atualizados += 1;
      } else {
        falhas += 1;
      }
    }

    setBulkLoading(false);

    if (atualizados > 0) {
      toast.success(
        `${atualizados} atleta${atualizados > 1 ? "s" : ""} atualizado${atualizados > 1 ? "s" : ""}.`
      );
    }
    if (falhas > 0) {
      toast.error(
        `${falhas} atleta${falhas > 1 ? "s" : ""} não puderam ser atualizados neste momento.`
      );
    }
    limparSelecao();
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 pt-6 pb-12" aria-busy={isUiLocked}>
      <Head>
        <title>Nível dos Atletas | Fut7Pro</title>
        <meta
          name="description"
          content="Defina habilidade e físico dos atletas para gerar um nível final mais justo no sorteio inteligente do Fut7Pro."
        />
        <meta property="og:title" content="Nível dos Atletas | Fut7Pro" />
        <meta
          property="og:description"
          content="Defina habilidade e físico dos atletas para gerar um nível final mais justo no sorteio inteligente do Fut7Pro."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://app.fut7pro.com.br/admin/jogadores/nivel-dos-atletas"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Nível dos Atletas | Fut7Pro" />
        <meta
          name="twitter:description"
          content="Defina habilidade e físico dos atletas para gerar um nível final mais justo no sorteio inteligente do Fut7Pro."
        />
        <link rel="canonical" href="https://app.fut7pro.com.br/admin/jogadores/nivel-dos-atletas" />
      </Head>

      <div className="bg-[#1A1A1A] rounded-2xl p-4 sm:p-6 text-white shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Nível dos atletas</h1>
            <p className="text-sm text-gray-300">
              Defina habilidade (1-5) e nível físico (1-3) para gerar o nível final usado no
              sorteio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FaFilter />
            <span>
              {atletasFiltrados.length} atletas filtrados de {atletas.length}
            </span>
          </div>
        </div>

        {!canEdit && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-200">
            Apenas Presidente, Vice-Presidente ou Diretor de Futebol pode editar níveis. A página
            está em modo de leitura.
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atleta..."
              className="w-full pl-9 pr-3 py-2 bg-[#232323] rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
              disabled={isUiLocked}
            />
          </div>

          <select
            value={posicao}
            onChange={(e) => setPosicao(e.target.value)}
            className="px-3 py-2 bg-[#232323] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
            disabled={isUiLocked}
          >
            <option value="todas">Todas as posições</option>
            {POSICOES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="px-3 py-2 bg-[#232323] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
            disabled={isUiLocked}
          >
            <option value="nivel">Nível final (maior)</option>
            <option value="habilidade">Habilidade (maior)</option>
            <option value="fisico">Físico (maior)</option>
            <option value="atualizado">Última alteração</option>
            <option value="nome">Nome (A-Z)</option>
            <option value="posicao">Posição</option>
          </select>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={apenasMensalistas}
                onChange={(e) => setApenasMensalistas(e.target.checked)}
                className="accent-yellow-400"
                disabled={isUiLocked}
              />
              Mensalistas
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={semNivel}
                onChange={(e) => setSemNivel(e.target.checked)}
                className="accent-yellow-400"
                disabled={isUiLocked}
              />
              Sem nível
            </label>
          </div>
        </div>

        <div className="mt-4 bg-[#202020] border border-zinc-800 rounded-xl p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
            <span>{selectedList.length} selecionados</span>
            <button
              type="button"
              onClick={selecionarTodos}
              className="px-2 py-1 rounded bg-[#2b2b2b] hover:bg-[#333] transition disabled:opacity-40"
              disabled={!canEdit || isUiLocked || atletasFiltrados.length === 0}
            >
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={limparSelecao}
              className="px-2 py-1 rounded bg-[#2b2b2b] hover:bg-[#333] transition disabled:opacity-40"
              disabled={!canEdit || isUiLocked}
            >
              Limpar
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
            <select
              value={bulkHabilidade}
              onChange={(e) => setBulkHabilidade(e.target.value)}
              className="px-2 py-1 rounded bg-[#2b2b2b] text-white disabled:opacity-40"
              disabled={!canEdit || isUiLocked}
            >
              <option value="">Habilidade</option>
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <select
              value={bulkFisico}
              onChange={(e) => setBulkFisico(e.target.value)}
              className="px-2 py-1 rounded bg-[#2b2b2b] text-white disabled:opacity-40"
              disabled={!canEdit || isUiLocked}
            >
              <option value="">Físico</option>
              {[1, 2, 3].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={aplicarEdicaoLote}
              className="px-3 py-1 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition disabled:opacity-40"
              disabled={!canEdit || isUiLocked}
            >
              {bulkLoading ? "Aplicando..." : "Aplicar"}
            </button>
          </div>
        </div>

        {showSkeleton && isInitialLoading && <NivelAtletasSkeleton />}

        {!showSkeleton && isInitialLoading && (
          <div className="mt-4 text-sm text-gray-300">Carregando atletas e níveis...</div>
        )}

        {!isInitialLoading && !loadingJogadores && atletasFiltrados.length === 0 && (
          <div className="mt-4 text-sm text-gray-400">Nenhum atleta encontrado com os filtros.</div>
        )}

        {!isInitialLoading && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {atletasFiltrados.map((item) => {
              const { jogador, habilidade, fisico, nivelFinal, atualizadoEm, atualizadoPorNome } =
                item;
              const tooltip = `Habilidade ${typeof habilidade === "number" ? habilidade : "-"}, Físico ${typeof fisico === "number" ? fisico : "-"}`;
              const nivelTexto = formatNivel(nivelFinal);
              const semHabilidade = typeof habilidade !== "number";
              const selecionado = Boolean(selectedIds[jogador.id]);
              const status = statusById[jogador.id];
              const statusLabel =
                status === "saved" ? "Salvo" : status === "error" ? "Falha ao salvar" : null;
              const statusClass =
                status === "saved"
                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                  : "border-red-500/40 text-red-300 bg-red-500/10";

              return (
                <div
                  key={jogador.id}
                  className="bg-[#232323] border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <AvatarFut7Pro
                        src={
                          jogador.avatarUrl ||
                          jogador.avatar ||
                          jogador.foto ||
                          "/images/jogadores/jogador_padrao_01.jpg"
                        }
                        alt={`Foto de ${jogador.nome || "Atleta"}`}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-white">
                            {jogador.nome || "Atleta"}
                          </h2>
                          {item.mensalista && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-black">
                              Mensalista
                            </span>
                          )}
                          {semHabilidade && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/80 text-white">
                              Definir
                            </span>
                          )}
                        </div>
                        {jogador.apelido && (
                          <div className="text-xs text-gray-400">{jogador.apelido}</div>
                        )}
                        <div className="text-xs text-gray-400">{item.posicao}</div>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => toggleSelecionado(jogador.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          selecionado
                            ? "bg-yellow-400 border-yellow-400 text-black"
                            : "border-gray-500 text-gray-400"
                        } disabled:opacity-40`}
                        title={selecionado ? "Remover seleção" : "Selecionar atleta"}
                        disabled={isUiLocked}
                      >
                        {selecionado ? <FaCheckCircle size={12} /> : <FaTimes size={10} />}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-400">Habilidade na posição</span>
                      <EditorEstrelas
                        value={habilidade || 0}
                        onChange={(val) => {
                          void handleHabilidadeChange(jogador.id, val);
                        }}
                        disabled={!canEdit || isUiLocked}
                        max={5}
                        size={16}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-400">Nível físico</span>
                      <EditorEstrelas
                        value={fisico || 0}
                        onChange={(val) => {
                          void handleFisicoChange(jogador.id, val);
                        }}
                        disabled={!canEdit || isUiLocked}
                        max={3}
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2" title={tooltip}>
                    <div className="flex items-center gap-2">
                      <StarRatingDisplay value={nivelFinal ?? 0} size={14} />
                      <span className="text-sm text-yellow-300">Nível do atleta: {nivelTexto}</span>
                    </div>
                    {statusLabel && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusClass}`}
                      >
                        {status === "saved" && <FaCheckCircle size={10} />}
                        {status === "error" && <FaTimes size={10} />}
                        {statusLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Última alteração: {atualizadoPorNome || "-"} {formatarDataHora(atualizadoEm)}
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirHistorico(jogador)}
                      className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200 disabled:opacity-40"
                      disabled={isUiLocked}
                    >
                      <FaHistory size={12} />
                      Histórico
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModalHistorico
        open={historicoOpen}
        atleta={historicoAtleta}
        onClose={() => setHistoricoOpen(false)}
      />
      <ModalSalvamento saving={activeSave} />
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import { usePerfil } from "@/components/atletas/PerfilContext";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import type { PublicMatch } from "@/types/partida";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";

const FORTALEZA_TZ = "America/Fortaleza";

function formatDateYMD(date: Date, timeZone: string) {
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

function getCurrentYear() {
  const year = new Intl.DateTimeFormat("en-US", {
    timeZone: FORTALEZA_TZ,
    year: "numeric",
  }).format(new Date());
  const parsed = Number.parseInt(year, 10);
  return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
}

function resolveTeamKey(team: PublicMatch["teamA"] | null | undefined, fallback?: string | null) {
  const key = team?.id ?? fallback ?? team?.name ?? "";
  if (!key) return "";
  return String(key);
}

function getMatchScore(match: PublicMatch) {
  const scoreA = match.score?.teamA ?? match.scoreA;
  const scoreB = match.score?.teamB ?? match.scoreB;
  if (typeof scoreA !== "number" || typeof scoreB !== "number") return null;
  return { scoreA, scoreB };
}

function countChampionDays(matches: PublicMatch[], athleteId?: string | null) {
  if (!athleteId) return 0;
  const matchesByDay = new Map<string, PublicMatch[]>();

  matches.forEach((match) => {
    const key = formatDateYMD(new Date(match.date), FORTALEZA_TZ);
    if (!key) return;
    const list = matchesByDay.get(key);
    if (list) {
      list.push(match);
    } else {
      matchesByDay.set(key, [match]);
    }
  });

  let total = 0;
  matchesByDay.forEach((dayMatches) => {
    const points = new Map<string, number>();

    dayMatches.forEach((match) => {
      const score = getMatchScore(match);
      if (!score) return;
      const teamAKey = resolveTeamKey(match.teamA, match.teamA?.id ?? null);
      const teamBKey = resolveTeamKey(match.teamB, match.teamB?.id ?? null);
      if (!teamAKey || !teamBKey) return;

      if (score.scoreA > score.scoreB) {
        points.set(teamAKey, (points.get(teamAKey) ?? 0) + 3);
        points.set(teamBKey, points.get(teamBKey) ?? 0);
      } else if (score.scoreB > score.scoreA) {
        points.set(teamBKey, (points.get(teamBKey) ?? 0) + 3);
        points.set(teamAKey, points.get(teamAKey) ?? 0);
      } else {
        points.set(teamAKey, (points.get(teamAKey) ?? 0) + 1);
        points.set(teamBKey, (points.get(teamBKey) ?? 0) + 1);
      }
    });

    if (!points.size) return;
    const [championKey] = Array.from(points.entries()).sort((a, b) => b[1] - a[1])[0];
    if (!championKey) return;

    const atletaNoTimeCampeao = dayMatches.some((match) =>
      (match.presences ?? []).some((presence) => {
        if (presence.status === "AUSENTE") return false;
        if (presence.athleteId !== athleteId) return false;
        const teamKey = resolveTeamKey(presence.team, presence.teamId ?? null);
        return teamKey === championKey;
      })
    );

    if (atletaNoTimeCampeao) total += 1;
  });

  return total;
}

function resolveAssiduidadeLevel(jogos: number) {
  if (jogos >= 100) return "Lenda";
  if (jogos >= 50) return "Veterano";
  if (jogos >= 20) return "Destaque";
  if (jogos >= 10) return "Titular";
  if (jogos >= 3) return "Juvenil";
  return "Novato";
}

// --- Card Mensalista Premium ---
function CartaoMensalistaPremium({
  nome,
  logoRacha,
  ativo = true,
}: {
  nome: string;
  logoRacha: string;
  ativo?: boolean;
}) {
  return (
    <div
      className={`
        relative w-[340px] h-[160px] rounded-2xl overflow-hidden
        border flex
        bg-[url('/images/bg-campo-fut7.jpg')] bg-cover bg-center
        transition
        shadow-[0_12px_28px_rgba(0,0,0,0.45)]
        ${ativo ? "border-emerald-400/40" : "border-white/10 opacity-90"}
      `}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-transparent to-black/40" />
      <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-emerald-400/70 via-emerald-200/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      {/* Lado esquerdo */}
      <div className="relative flex flex-col justify-between pl-5 py-4 flex-1">
        <div>
          <div className="text-emerald-200 font-extrabold text-base drop-shadow-sm tracking-wide">
            MENSALISTA
          </div>
        </div>
      </div>
      {/* Lado direito */}
      <div className="relative flex flex-col items-center justify-between w-[140px] py-3 pr-5">
        <div className="text-emerald-200 font-semibold text-xs mb-1 mt-1">Ativo no mês</div>
        <Image
          src={logoRacha}
          alt="Logo do Racha"
          width={54}
          height={54}
          className="rounded-lg border border-white/20 mb-1 bg-black/20"
          draggable={false}
        />
        <div
          className="text-white font-bold text-sm mt-2 text-center"
          style={{
            textShadow: "0px 2px 8px #000, 0px 1px 0px #222, 0px 0px 2px #000",
          }}
        >
          {nome}
        </div>
      </div>
      {/* Tooltip - canto inferior esquerdo */}
      {ativo && (
        <div className="absolute left-2 bottom-2 bg-black/70 px-2 py-1 rounded text-[10px] text-emerald-200 pointer-events-none select-none">
          Mensalista, prioridade garantida
        </div>
      )}
    </div>
  );
}

// --- Card Solicitar Mensalista ---
function CardSolicitarMensalista({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleConfirm() {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onConfirm();
      setModalOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="group relative w-full max-w-[360px] min-h-[176px] overflow-hidden rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#0b1220_0%,#0f172a_55%,#111827_100%)] px-5 py-5 text-left shadow-[0_18px_36px_rgba(0,0,0,0.45)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/70 hover:shadow-[0_22px_46px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
        onClick={() => setModalOpen(true)}
        title="Solicitar vaga de mensalista"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(16,185,129,0.22),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(16,185,129,0.16),transparent_38%)]" />
        <div className="relative flex h-full flex-col">
          <span className="inline-flex w-fit rounded-full border border-emerald-300/45 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
            Plano mensal
          </span>
          <h3 className="mt-3 text-[22px] font-extrabold leading-tight text-white">
            Torne-se mensalista
          </h3>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-zinc-200">
            Garanta prioridade nas partidas, benefícios exclusivos e mais previsibilidade para jogar
            toda semana.
          </p>
          <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 transition group-hover:bg-emerald-300">
            Solicitar vaga agora
          </span>
        </div>
      </button>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-emerald-400/60 bg-zinc-900 p-6 shadow-xl sm:p-8">
            <div className="text-lg font-semibold text-brand mb-2 text-center">
              Solicitar vaga de Mensalista
            </div>
            <div className="text-sm text-zinc-100 text-center mb-6">
              Ao confirmar, seu pedido para se tornar mensalista será enviado ao administrador.
              <br />
              <span className="text-brand-soft">
                Caso todas as vagas já estejam ocupadas, você entrará automaticamente na lista de
                espera por ordem de solicitação.
              </span>
              <br />
              Deseja realmente enviar este pedido?
            </div>
            {submitError && (
              <p className="mb-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                {submitError}
              </p>
            )}
            <div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded px-5 py-2 font-semibold text-zinc-950 transition bg-emerald-500 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Confirmar"}
              </button>
              <button
                type="button"
                className="rounded bg-zinc-700 px-5 py-2 font-semibold text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Página ---
export default function PerfilUsuarioPage() {
  const { usuario, roleLabel, isLoading, isError, isAuthenticated, isPendingApproval } =
    usePerfil();
  const router = useRouter();
  const { publicHref, publicSlug } = usePublicLinks();
  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/perfil"));
    return `${publicHref("/entrar")}?${params.toString()}`;
  }, [publicHref]);
  const [statsPeriod, setStatsPeriod] = useState<"current" | "all">("current");
  const [pedidoEnviado, setPedidoEnviado] = useState<boolean>(
    usuario?.mensalistaRequestStatus === "PENDING"
  );
  const currentYear = useMemo(() => getCurrentYear(), []);
  const rangeFrom = statsPeriod === "all" ? "2000-01-01" : `${currentYear}-01-01`;
  const rangeTo =
    statsPeriod === "all" ? formatDateYMD(new Date(), FORTALEZA_TZ) : `${currentYear}-12-31`;
  const athleteSlug = usuario?.slug;

  const { athlete, conquistas } = usePublicAthlete({
    tenantSlug: publicSlug,
    athleteSlug,
    enabled: Boolean(publicSlug && athleteSlug && isAuthenticated && !isPendingApproval),
  });

  const {
    rankings,
    isLoading: isLoadingRankings,
    isError: isErrorRankings,
  } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: statsPeriod === "all" ? "all" : "year",
    year: statsPeriod === "all" ? undefined : currentYear,
  });

  const {
    matches,
    isLoading: isLoadingMatches,
    isError: isErrorMatches,
  } = usePublicMatches({
    slug: publicSlug,
    from: rangeFrom,
    to: rangeTo,
    enabled: Boolean(publicSlug && isAuthenticated && !isPendingApproval),
  });

  const atletaRanking = useMemo(() => {
    if (!rankings.length) return null;
    return (
      rankings.find(
        (item) => item.slug === athleteSlug || item.id === athlete?.id || item.id === usuario?.id
      ) ?? null
    );
  }, [rankings, athleteSlug, athlete?.id, usuario?.id]);

  const athleteId = athlete?.id || atletaRanking?.id || usuario?.id || null;
  const campeaoDia = useMemo(() => countChampionDays(matches, athleteId), [matches, athleteId]);

  async function solicitarVagaMensalista() {
    if (!publicSlug) {
      throw new Error("Não foi possível identificar o racha para enviar sua solicitação.");
    }

    const response = await fetch(
      `/api/public/${encodeURIComponent(publicSlug)}/mensalistas/request`,
      {
        method: "POST",
        cache: "no-store",
      }
    );

    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text || null;
    }

    if (!response.ok) {
      const payload = typeof body === "object" && body ? (body as Record<string, unknown>) : null;
      const message =
        (typeof payload?.message === "string" ? payload.message : null) ||
        (typeof payload?.error === "string" ? payload.error : null) ||
        (typeof body === "string" ? body : null) ||
        "Não foi possível enviar sua solicitação agora.";
      throw new Error(message);
    }

    setPedidoEnviado(true);
  }
  const stats = useMemo(() => {
    if (isLoadingRankings || isErrorRankings) return null;
    const jogos = atletaRanking?.jogos ?? 0;
    const vitorias = atletaRanking?.vitorias ?? 0;
    const mediaVitorias = jogos > 0 ? vitorias / jogos : 0;
    const campeaoDiaValue = isLoadingMatches || isErrorMatches ? null : campeaoDia;
    return {
      jogos,
      gols: atletaRanking?.gols ?? 0,
      assistencias: atletaRanking?.assistencias ?? 0,
      campeaoDia: campeaoDiaValue,
      mediaVitorias,
      pontuacao: atletaRanking?.pontos ?? 0,
    };
  }, [
    isLoadingRankings,
    isErrorRankings,
    atletaRanking,
    campeaoDia,
    isLoadingMatches,
    isErrorMatches,
  ]);

  const nivelAssiduidade = stats
    ? resolveAssiduidadeLevel(stats.jogos)
    : isErrorRankings
      ? "Indisponivel"
      : "Carregando";

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    if (isPendingApproval) {
      router.replace(publicHref("/aguardando-aprovacao"));
    }
  }, [isAuthenticated, isLoading, isPendingApproval, router, publicHref]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(loginHref);
    }
  }, [isAuthenticated, isLoading, router, loginHref]);

  useEffect(() => {
    if (usuario?.mensalistaRequestStatus === "PENDING") {
      setPedidoEnviado(true);
    }
  }, [usuario?.mensalistaRequestStatus]);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">Carregando perfil...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para o login...
      </div>
    );
  }

  if (isError || !usuario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-red-200">
        Nao foi possivel carregar o perfil. Tente novamente mais tarde.
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para a tela de aguardando aprovacao...
      </div>
    );
  }

  const athleteSlugForLinks = athlete?.slug || usuario.slug;

  const {
    titulosGrandesTorneios = [],
    titulosAnuais = [],
    titulosQuadrimestrais = [],
  } = conquistas ?? {};
  return (
    <div className="p-6 text-white w-full">
      <h1 className="sr-only">Meu Perfil – Estatísticas, Conquistas e Histórico | Fut7Pro</h1>
      {isPendingApproval && (
        <div className="mb-6 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand-soft">
          <strong className="block text-brand-soft">Aguardando aprovacao do admin.</strong>
          Seu cadastro foi recebido e o acesso completo sera liberado em breve.
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Dados do usuário logado */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
          <AvatarFut7Pro
            src={usuario.foto}
            alt={`Foto de ${usuario.nome}`}
            width={160}
            height={160}
            className="rounded-full border-4 border-brand"
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold mb-1">{usuario.nome}</h2>
            {usuario.apelido && <p className="text-brand-soft mb-1">Apelido: {usuario.apelido}</p>}
            {roleLabel && (
              <span className="inline-block bg-brand text-black rounded px-3 py-1 text-xs font-bold mt-1">
                {roleLabel}
              </span>
            )}
            <p className="text-sm">Posição: {usuario.posicao}</p>
            <p className="text-sm">
              Posicao secundaria: {usuario.posicaoSecundaria || "Nao informado"}
            </p>
            <p
              className="text-sm text-zinc-300"
              title={`Último jogo: ${usuario.ultimaPartida ?? "Data não registrada"}`}
            >
              Status: {usuario.status}
            </p>
            <p className="text-sm mt-1">
              {usuario.mensalista ? (
                <span className="text-green-400 font-semibold">MENSALISTA ATIVO</span>
              ) : (
                <span className="text-zinc-400">NAO E MENSALISTA</span>
              )}
            </p>
            <p className="text-sm mt-1">Nivel de Assiduidade: {nivelAssiduidade}</p>

            {isPendingApproval && (
              <span className="mt-4 inline-flex rounded-full border border-brand/40 px-3 py-1 text-xs font-semibold text-brand-soft">
                Cadastro em aprovacao
              </span>
            )}
          </div>
        </div>
        {/* Cartão à direita: Mensalista Premium OU Solicitar Mensalista */}
        <div className="w-full md:w-auto flex-shrink-0 flex justify-center">
          {isPendingApproval ? (
            <div className="w-[340px] h-[160px] flex flex-col items-center justify-center bg-brand-soft border-4 border-brand-strong/60 rounded-2xl shadow-md text-center text-brand-strong font-semibold text-lg">
              Cadastro em analise.
              <br />
              <span className="text-sm font-normal text-brand-soft">
                Aguarde a aprovacao para liberar as acoes do perfil.
              </span>
            </div>
          ) : usuario.mensalista ? (
            <CartaoMensalistaPremium
              nome={usuario.nome}
              logoRacha="/images/logos/logo_fut7pro.png"
              ativo={usuario.mensalista}
            />
          ) : !pedidoEnviado ? (
            <CardSolicitarMensalista onConfirm={solicitarVagaMensalista} />
          ) : (
            <div className="w-[340px] h-[160px] flex flex-col items-center justify-center bg-green-900/80 border-4 border-green-500 rounded-2xl shadow-md text-center text-green-200 font-semibold text-lg">
              Pedido enviado! Aguarde a análise do administrador.
              <br />
              <span className="text-sm font-normal text-green-300">
                Sua solicitação entrou na fila de avaliação do racha.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filtro de estatísticas */}
      <div className="flex gap-4 mt-8 mb-2 items-center">
        <span className="font-semibold text-brand">Estatísticas:</span>
        <button
          className={`px-3 py-1 rounded font-semibold border transition ${
            statsPeriod === "current"
              ? "bg-brand text-black border-brand"
              : "bg-zinc-900 text-brand-soft border-brand"
          }`}
          onClick={() => setStatsPeriod("current")}
        >
          Temporada atual
        </button>
        <button
          className={`px-3 py-1 rounded font-semibold border transition ${
            statsPeriod === "all"
              ? "bg-brand text-black border-brand"
              : "bg-zinc-900 text-brand-soft border-brand"
          }`}
          onClick={() => setStatsPeriod("all")}
        >
          Todas as Temporadas
        </button>
      </div>

      {/* Estatísticas */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { label: "Jogos", valor: stats?.jogos ?? "-" },
            { label: "Gols", valor: stats?.gols ?? "-" },
            { label: "Assistências", valor: stats?.assistencias ?? "-" },
            { label: "Campeão do Dia", valor: stats?.campeaoDia ?? "-" },
            {
              label: "Média Vitórias",
              valor:
                typeof stats?.mediaVitorias === "number" ? stats?.mediaVitorias.toFixed(2) : "-",
            },
            { label: "Pontuação", valor: stats?.pontuacao ?? "-" },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-800 p-4 rounded text-center shadow-md">
              <p className="text-xl font-bold text-brand">{item.valor}</p>
              <p className="text-sm text-zinc-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conquistas */}
      <section className="mt-12">
        <ConquistasDoAtleta
          slug={athleteSlugForLinks}
          titulosGrandesTorneios={titulosGrandesTorneios}
          titulosAnuais={titulosAnuais}
          titulosQuadrimestrais={titulosQuadrimestrais}
        />
      </section>

      {/* Histórico */}
      {usuario.historico && usuario.historico.length > 0 && (
        <section className="mt-12">
          <HistoricoJogos historico={usuario.historico} />
          <div className="text-center mt-4">
            <span className="inline-block text-brand text-sm opacity-70 cursor-not-allowed">
              Ver histórico completo (apenas admin)
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { FaRandom, FaUsers, FaMoneyBillWave, FaMedal, FaBirthdayCake } from "react-icons/fa";
import BannerNotificacoes from "@/components/admin/BannerNotificacoes";
import CardTimeCampeaoDoDia from "@/components/admin/CardTimeCampeaoDoDia";
import CardCicloPlano from "@/components/admin/CardCicloPlano";
import CardPlanoAtual from "@/components/admin/CardPlanoAtual";
import CardResumoFinanceiro from "@/components/admin/CardResumoFinanceiro";
import CardProximosRachas from "@/components/admin/CardProximosRachas";
import CardAcoesRapidas from "@/components/admin/CardAcoesRapidas";
import CardRelatoriosEngajamento from "@/components/admin/CardRelatoriosEngajamento";
import { useRacha } from "@/context/RachaContext";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { useJogadores } from "@/hooks/useJogadores";
import { useAdminBirthdays } from "@/hooks/useAdminBirthdays";
import useSubscription from "@/hooks/useSubscription";
import { rachaConfig } from "@/config/racha.config";
import FinanceiroChart from "@/components/admin/FinanceiroChart";
import type { PublicMatch } from "@/types/partida";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatMatchLabel(match: PublicMatch) {
  const parsed = new Date(match.date);
  if (Number.isNaN(parsed.getTime())) {
    return { label: "Data indefinida", detalhe: match.location || "" };
  }
  const dia = String(parsed.getDate()).padStart(2, "0");
  const mes = String(parsed.getMonth() + 1).padStart(2, "0");
  const hora = String(parsed.getHours()).padStart(2, "0");
  const minuto = String(parsed.getMinutes()).padStart(2, "0");
  const weekday = WEEKDAYS[parsed.getDay()];
  return {
    label: `${weekday} ${dia}/${mes} - ${hora}:${minuto}`,
    detalhe:
      match.location || `${match.teamA?.name ?? "Time A"} x ${match.teamB?.name ?? "Time B"}`,
  };
}

function pickWinner(match: PublicMatch) {
  const scoreA = match.score?.teamA ?? match.scoreA ?? null;
  const scoreB = match.score?.teamB ?? match.scoreB ?? null;
  if (scoreA === null || scoreB === null || scoreA === scoreB) return null;
  return scoreA > scoreB ? match.teamA : match.teamB;
}

function isSameMonth(date: Date, compare: Date) {
  return date.getFullYear() === compare.getFullYear() && date.getMonth() === compare.getMonth();
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { rachaId, tenantSlug: contextTenantSlug, setRachaId, setTenantSlug } = useRacha();
  const sessionUser = session?.user as
    | (Session["user"] & { tenantId?: string; tenantSlug?: string })
    | undefined;
  const tenantId = sessionUser?.tenantId;
  const tenantSlug = sessionUser?.tenantSlug;

  useEffect(() => {
    if (tenantId) {
      setRachaId(tenantId);
    }
    if (tenantSlug) {
      setTenantSlug(tenantSlug);
    }
  }, [tenantId, tenantSlug, setRachaId, setTenantSlug]);

  const slug = tenantSlug || contextTenantSlug || rachaConfig.slug;

  const { lancamentos, isLoading: loadingFinanceiro } = useFinanceiro();
  const { matches: upcomingMatches, isLoading: loadingUpcoming } = usePublicMatches({
    slug,
    scope: "upcoming",
    limit: 5,
  });
  const { matches: recentMatches } = usePublicMatches({
    slug,
    scope: "recent",
    limit: 3,
  });
  const { jogadores, isLoading: loadingJogadores } = useJogadores(rachaId);
  const { birthdays: aniversariantes, isLoading: loadingAniversariantes } = useAdminBirthdays({
    rangeDays: 30,
    limit: 3,
  });
  const {
    subscription,
    subscriptionStatus,
    loading: loadingSubscription,
  } = useSubscription(tenantId);

  const resumoFinanceiro = useMemo(() => {
    if (!lancamentos?.length) return null;
    const now = new Date();
    const doMes = lancamentos.filter((l) => {
      if (!l.data) return false;
      const dt = new Date(l.data);
      return !Number.isNaN(dt.getTime()) && isSameMonth(dt, now);
    });
    const base = doMes.length ? doMes : lancamentos;
    const receitas = base
      .filter((l) => (l.valor ?? 0) > 0)
      .reduce((acc, l) => acc + (l.valor ?? 0), 0);
    const despesas = base
      .filter((l) => (l.valor ?? 0) < 0)
      .reduce((acc, l) => acc + (l.valor ?? 0), 0);
    const saldo = base.reduce((acc, l) => acc + (l.valor ?? 0), 0);
    return {
      saldo,
      receitas,
      despesas,
      periodoLabel: doMes.length ? "mes" : "todo historico",
    };
  }, [lancamentos]);

  const proximosRachas = useMemo(
    () =>
      upcomingMatches.map((m) => {
        const formatted = formatMatchLabel(m);
        return { id: m.id, dataStr: formatted.label, detalhe: formatted.detalhe };
      }),
    [upcomingMatches]
  );

  const ultimoCampeao = useMemo(() => {
    if (!recentMatches?.length) return null;
    const finalizadas = [...recentMatches].filter((m) => {
      const scoreA = m.score?.teamA ?? m.scoreA ?? null;
      const scoreB = m.score?.teamB ?? m.scoreB ?? null;
      return scoreA !== null && scoreB !== null;
    });
    if (!finalizadas.length) return null;
    const ordered = finalizadas.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const vencedor = pickWinner(ordered[0]);
    if (!vencedor) return null;
    return {
      nome: vencedor.name || "Time campeao do dia",
      logo: vencedor.logoUrl || "/images/times/time_padrao_01.png",
    };
  }, [recentMatches]);

  const assiduos = useMemo(() => {
    if (!jogadores?.length) return [];
    return [...jogadores]
      .sort((a, b) => (b.presencas ?? b.partidas ?? 0) - (a.presencas ?? a.partidas ?? 0))
      .slice(0, 3);
  }, [jogadores]);

  return (
    <>
      <Head>
        <title>Dashboard do Racha | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie seu racha, jogadores, partidas, rankings e financas com dados reais do painel Fut7Pro."
        />
        <meta
          name="keywords"
          content="painel admin fut7, dashboard racha, fut7pro, futebol amador, sorteio de times, monetizacao racha"
        />
      </Head>

      <div className="flex flex-col gap-6 w-full px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <BannerNotificacoes />

        <section className="w-full grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-600 to-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-xl shadow">
              POS-JOGO
            </span>
            <CardTimeCampeaoDoDia
              fotoUrl={ultimoCampeao?.logo}
              nomeTime={ultimoCampeao?.nome}
              editLink="/admin/partidas/time-campeao-do-dia"
            />
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-800 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              PRE-JOGO
            </span>
            <Link
              href="/admin/partidas/times-do-dia"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#00d3d4] cursor-pointer group min-h-[265px]"
              aria-label="Times do Dia"
            >
              <FaUsers className="text-[#00d3d4] w-10 h-10 mb-2 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-white mb-1">Times do Dia</span>
              <span className="text-sm text-gray-400 mb-2 text-center">
                Veja as escalacoes e confrontos automaticos do racha de hoje.
              </span>
              <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-[#00d3d4] text-xs font-semibold">
                Ver Escalacoes
              </span>
            </Link>
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-800 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              PRE-JOGO
            </span>
            <Link
              href="/admin/partidas/sorteio-inteligente"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#ffdf38] cursor-pointer group min-h-[265px]"
              aria-label="Sorteio Inteligente"
            >
              <FaRandom className="text-[#ffdf38] w-10 h-10 mb-2 group-hover:rotate-12 transition" />
              <span className="text-xl font-bold text-white mb-1">Sorteio Inteligente</span>
              <span className="text-sm text-gray-400 mb-2 text-center">
                Monte os times de forma automatica, balanceada e transparente.
              </span>
              <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-[#ffdf38] text-xs font-semibold">
                Acessar Sorteio
              </span>
            </Link>
          </div>
        </section>

        <section className="w-full grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-green-700 to-green-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              MONETIZE!
            </span>
            <Link
              href="/admin/monetizacao"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#38d957] cursor-pointer group min-h-[180px] md:min-h-[210px]"
            >
              <FaMoneyBillWave className="text-[#38d957] w-10 h-10 mb-2 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-white mb-1 text-center">
                Monetizacao
                <br />
                (Lucre Mais)
              </span>
            </Link>
          </div>
          <CardResumoFinanceiro
            resumo={resumoFinanceiro ?? undefined}
            isLoading={loadingFinanceiro}
          />
        </section>

        <CardRelatoriosEngajamento />

        <FinanceiroChart
          lancamentos={lancamentos}
          isLoading={loadingFinanceiro || loadingSubscription}
          emptyMessage="Cadastre lancamentos para visualizar o desempenho financeiro."
        />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <CardCicloPlano
            subscription={subscription}
            status={subscriptionStatus}
            loading={loadingSubscription}
          />
          <CardPlanoAtual
            subscription={subscription}
            status={subscriptionStatus}
            loading={loadingSubscription}
          />
        </div>

        <section className="w-full grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
          <CardProximosRachas proximos={proximosRachas} isLoading={loadingUpcoming} />

          <div className="block hover:scale-[1.025] transition">
            <div className="bg-[#23272F] rounded-xl shadow p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <FaMedal className="text-yellow-500 w-6 h-6" />
                <span className="text-lg font-bold text-gray-100">Mais assiduos</span>
              </div>
              {loadingJogadores ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-5 bg-neutral-700 rounded w-5/6 animate-pulse" />
                  ))}
                </div>
              ) : assiduos.length ? (
                <div className="flex flex-col gap-2 mb-1">
                  {assiduos.map((j) => (
                    <div key={j.id} className="flex items-center gap-3">
                      <Image
                        src={
                          j.avatar ||
                          j.foto ||
                          j.photoUrl ||
                          "/images/jogadores/jogador_padrao_01.jpg"
                        }
                        alt={`Jogador assiduo ${j.nome}`}
                        width={32}
                        height={32}
                        className="rounded-full border border-gray-500"
                      />
                      <span className="text-gray-100 font-semibold truncate">{j.nome}</span>
                      <span className="ml-auto text-green-400 font-bold">
                        {j.presencas ?? j.partidas ?? 0}j
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Nenhum dado de presenca encontrado.</span>
              )}
              <span className="text-xs text-gray-400 mt-2">Ranking por presenca</span>
            </div>
          </div>

          <div className="block hover:scale-[1.025] transition">
            <div className="bg-[#23272F] rounded-xl shadow p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <FaBirthdayCake className="text-blue-400 w-6 h-6" />
                <span className="text-lg font-bold text-gray-100">Aniversariantes</span>
              </div>
              {loadingAniversariantes ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-5 bg-neutral-700 rounded w-5/6 animate-pulse" />
                  ))}
                </div>
              ) : aniversariantes.length ? (
                <div className="flex flex-col gap-2">
                  {aniversariantes.map((a) => (
                    <div key={a.id} className="flex items-center gap-3">
                      <Image
                        src={a.photoUrl || "/images/jogadores/jogador_padrao_01.jpg"}
                        alt={`Aniversariante ${a.name}`}
                        width={32}
                        height={32}
                        className="rounded-full border border-gray-500"
                      />
                      <span className="text-gray-100 font-semibold truncate">
                        {a.nickname || a.name}
                      </span>
                      <span className="ml-auto text-yellow-300 font-bold">
                        {`${String(a.birthDay).padStart(2, "0")}/${String(a.birthMonth).padStart(2, "0")}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Nenhum aniversario proximo.</span>
              )}
              <span className="text-xs text-gray-400 mt-2">Deseje parabens!</span>
            </div>
          </div>
        </section>

        <CardAcoesRapidas
          cadastrarJogador="/admin/jogadores/listar-cadastrar"
          criarPartida="/admin/partidas/criar"
          adicionarPatrocinador="/admin/financeiro/patrocinadores"
          enviarNotificacao="/admin/comunicacao/notificacoes"
        />
      </div>
    </>
  );
}

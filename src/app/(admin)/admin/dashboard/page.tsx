"use client";

import { useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  FaRandom,
  FaClipboardList,
  FaMoneyBillWave,
  FaMedal,
  FaBirthdayCake,
} from "react-icons/fa";
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
import { useRachaAgenda } from "@/hooks/useRachaAgenda";
import { useJogadores } from "@/hooks/useJogadores";
import { useAdminBirthdays } from "@/hooks/useAdminBirthdays";
import useSubscription from "@/hooks/useSubscription";
import FinanceiroChart from "@/components/admin/FinanceiroChart";
import { useMe } from "@/hooks/useMe";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import { buildAttendanceRanking, formatAttendanceCount } from "@/lib/attendance";
import type { RachaAgendaItem } from "@/types/agenda";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

function formatNextAgendaDate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if ([year, month, day].some((part) => Number.isNaN(part))) return null;
  const date = new Date(year, month - 1, day);
  const weekday = WEEKDAYS_SHORT[date.getDay()] ?? "";
  const formattedDay = String(date.getDate()).padStart(2, "0");
  const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${weekday} ${formattedDay}/${formattedMonth}`;
}

function formatAgendaLabel(item: RachaAgendaItem) {
  const weekday = DIAS_SEMANA[item.weekday] ?? "Dia cadastrado";
  const nextDate = formatNextAgendaDate(item.nextDate);
  const details = [
    nextDate ? `Proximo: ${nextDate}` : null,
    item.holiday ? `Feriado: ${item.holidayName || "data marcada"}` : null,
  ].filter(Boolean);

  return {
    id: item.id,
    dataStr: `${weekday} - ${item.time}`,
    detalhe: details.join(" | "),
  };
}

function isSameMonth(date: Date, compare: Date) {
  return date.getFullYear() === compare.getFullYear() && date.getMonth() === compare.getMonth();
}

export default function AdminDashboard() {
  const { me } = useMe({ context: "admin" });
  const { rachaId, tenantSlug: contextTenantSlug } = useRacha();
  const tenantId = rachaId || me?.tenant?.tenantId || "";
  const slug = contextTenantSlug || me?.tenant?.tenantSlug || "";

  const { lancamentos, isLoading: loadingFinanceiro } = useFinanceiro();
  const { items: agendaItems, isLoading: loadingAgenda } = useRachaAgenda({
    enabled: Boolean(tenantId || slug),
  });
  const { jogadores, isLoading: loadingJogadores } = useJogadores(tenantId);
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
      periodoLabel: doMes.length ? "mês" : "todo histórico",
    };
  }, [lancamentos]);

  const proximosRachas = useMemo(() => {
    return [...agendaItems]
      .sort((a, b) => {
        if (a.weekday !== b.weekday) return a.weekday - b.weekday;
        return a.time.localeCompare(b.time);
      })
      .slice(0, 5)
      .map(formatAgendaLabel);
  }, [agendaItems]);

  const assiduos = useMemo(() => {
    if (!jogadores?.length) return [];
    return buildAttendanceRanking(jogadores, "todos")
      .filter((item) => item.jogos > 0)
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
              PÓS-JOGO
            </span>
            <CardTimeCampeaoDoDia editLink="/admin/partidas/time-campeao-do-dia" />
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-emerald-700 to-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              PÓS-JOGO
            </span>
            <Link
              href="/admin/partidas"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-emerald-400 cursor-pointer group min-h-[265px]"
              aria-label="Partidas e Resultados"
              data-testid="admin-dashboard-card-partidas-resultados"
            >
              <FaClipboardList className="text-emerald-400 w-10 h-10 mb-2 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-white mb-1">Partidas e Resultados</span>
              <span className="text-sm text-gray-400 mb-2 text-center">
                Acompanhe rodadas, revise confrontos e continue o lançamento dos resultados do dia.
              </span>
              <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-emerald-300 text-xs font-semibold">
                Acessar resultados
              </span>
            </Link>
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-800 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              PRÉ-JOGO
            </span>
            <Link
              href="/admin/partidas/sorteio-inteligente"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#ffdf38] cursor-pointer group min-h-[265px]"
              aria-label="Sorteio Inteligente"
              data-testid="admin-dashboard-card-sorteio-inteligente"
            >
              <FaRandom className="text-[#ffdf38] w-10 h-10 mb-2 group-hover:rotate-12 transition" />
              <span className="text-xl font-bold text-white mb-1">Sorteio Inteligente</span>
              <span className="text-sm text-gray-400 mb-2 text-center">
                Monte os times de forma automática, balanceada e transparente.
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
              data-testid="admin-dashboard-card-monetizacao"
            >
              <FaMoneyBillWave className="text-[#38d957] w-10 h-10 mb-2 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-white mb-1 text-center">
                Monetização
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
          emptyMessage="Cadastre lançamentos para visualizar o desempenho financeiro."
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
          <CardProximosRachas proximos={proximosRachas} isLoading={loadingAgenda} />

          <div className="block hover:scale-[1.025] transition">
            <div className="bg-[#23272F] rounded-xl shadow p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <FaMedal className="text-yellow-500 w-6 h-6" />
                <span className="text-lg font-bold text-gray-100">Mais assíduos</span>
              </div>
              {loadingJogadores ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-5 bg-neutral-700 rounded w-5/6 animate-pulse" />
                  ))}
                </div>
              ) : assiduos.length ? (
                <div className="flex flex-col gap-2 mb-1">
                  {assiduos.map(({ player: j, jogos }, index) => (
                    <div
                      key={j.id}
                      className="flex items-center gap-3 rounded-lg bg-[#1b1f25] px-3 py-2"
                    >
                      <span className="w-6 shrink-0 text-sm font-bold text-yellow-300">
                        #{index + 1}
                      </span>
                      <AvatarFut7Pro
                        src={j.avatar || j.foto || j.photoUrl || DEFAULT_AVATAR}
                        alt={`Jogador assiduo ${j.nome}`}
                        width={32}
                        height={32}
                        fallbackSrc={DEFAULT_AVATAR}
                        className="rounded-full border border-gray-500 object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-gray-100 font-semibold">
                        {j.apelido || j.nome}
                      </span>
                      <span className="ml-auto whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                        {formatAttendanceCount(jogos)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Nenhum dado de presença encontrado.</span>
              )}
              <span className="text-xs text-gray-400 mt-2">
                Presenças válidas: titular ou substituto
              </span>
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
                <span className="text-sm text-gray-400">Nenhum aniversário próximo.</span>
              )}
              <span className="text-xs text-gray-400 mt-2">Deseje parabéns!</span>
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

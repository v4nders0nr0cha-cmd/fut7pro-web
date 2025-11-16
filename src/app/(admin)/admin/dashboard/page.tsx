"use client";

import Head from "next/head";
import { useMemo } from "react";
import BannerNotificacoes from "@/components/admin/BannerNotificacoes";
import CardTimeCampeaoDoDia from "@/components/admin/CardTimeCampeaoDoDia";
import CardCicloPlano from "@/components/admin/CardCicloPlano";
import CardPlanoAtual from "@/components/admin/CardPlanoAtual";
import CardResumoFinanceiro from "@/components/admin/CardResumoFinanceiro";
import CardProximosRachas from "@/components/admin/CardProximosRachas";
import CardAcoesRapidas from "@/components/admin/CardAcoesRapidas";
import CardRelatoriosEngajamento from "@/components/admin/CardRelatoriosEngajamento";
import { FaRandom, FaUsers, FaMoneyBillWave, FaMedal, FaBirthdayCake } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useAdminPlayerRankings } from "@/hooks/useAdminPlayerRankings";
import { useAdminBirthdays } from "@/hooks/useAdminBirthdays";

const diasRestantes = 5;
const tipoPlano:
  | "trial"
  | "gratuito"
  | "mensal"
  | "mensal-marketing"
  | "anual"
  | "anual-marketing" = "trial";

const AVATAR_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

const formatShortDate = (value?: string | null) => {
  if (!value) return "--/--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export default function AdminDashboard() {
  const agora = useMemo(() => new Date(), []);
  const {
    rankings: rankingAssiduos,
    isLoading: carregandoRankingAssiduidade,
    isError: erroRankingAssiduidade,
    error: mensagemErroRankingAssiduidade,
  } = useAdminPlayerRankings({
    type: "geral",
    limit: 10,
    period: "month",
    year: agora.getFullYear(),
    month: agora.getMonth() + 1,
  });

  const jogadoresAssiduos = useMemo(
    () =>
      [...rankingAssiduos]
        .map((atleta) => ({
          id: atleta.id,
          nome: atleta.nome,
          photoUrl: atleta.photoUrl?.trim() || AVATAR_FALLBACK,
          jogos: atleta.jogos ?? 0,
        }))
        .sort((a, b) => b.jogos - a.jogos)
        .slice(0, 3),
    [rankingAssiduos]
  );

  const {
    birthdays: aniversariantes,
    isLoading: carregandoAniversariantes,
    isError: erroAniversariantes,
    error: mensagemErroAniversariantes,
  } = useAdminBirthdays({
    rangeDays: 60,
    limit: 3,
  });

  return (
    <>
      <Head>
        <title>Dashboard do Racha | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie seu racha, jogadores, partidas, rankings e finanças com o painel mais avançado do Brasil. Exclusivo Fut7Pro."
        />
        <meta
          name="keywords"
          content="painel admin fut7, dashboard racha, plataforma fut7pro, futebol amador, administrar racha, sorteio de times, monetização racha, relatórios engajamento"
        />
      </Head>

      <div className="flex flex-col gap-6 w-full px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        {/* Banner só para alertas importantes */}
        <BannerNotificacoes />

        {/* Cards principais */}
        <section className="w-full grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-600 to-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-xl shadow">
              ⚡ PÓS-JOGO
            </span>
            <CardTimeCampeaoDoDia
              fotoUrl="/images/times/time_campeao_padrao_01.png"
              nomeTime="Time Campeão do Dia"
              editLink="/admin/partidas/time-campeao-do-dia"
            />
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-800 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              ⚙️ PRÉ-JOGO
            </span>
            <Link
              href="/admin/partidas/times-do-dia"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#00d3d4] cursor-pointer group min-h-[265px]"
              aria-label="Times do Dia"
            >
              <FaUsers className="text-[#00d3d4] w-10 h-10 mb-2 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-white mb-1">Times do Dia</span>
              <span className="text-sm text-gray-400 mb-2 text-center">
                Veja as escalações e confrontos automáticos do racha de hoje.
              </span>
              <span className="mt-auto px-4 py-1 rounded bg-[#1a1e22] text-[#00d3d4] text-xs font-semibold">
                Ver Escalações
              </span>
            </Link>
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-800 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              ⚙️ PRÉ-JOGO
            </span>
            <Link
              href="/admin/partidas/sorteio-inteligente"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#ffdf38] cursor-pointer group min-h-[265px]"
              aria-label="Sorteio Inteligente"
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

        {/* Monetização + Financeiro lado a lado */}
        <section className="w-full grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-green-700 to-green-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              💰 MONETIZE!
            </span>
            <Link
              href="/admin/monetizacao"
              className="bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 ring-[#38d957] cursor-pointer group min-h-[180px] md:min-h-[210px]"
            >
              <FaMoneyBillWave className="text-[#38d957] w-10 h-10 mb-2 group-hover:scale-110 transition" />
              <span className="text-xl font-bold text-white mb-1 text-center">
                Monetização
                <br />
                (Lucre Mais)
              </span>
            </Link>
          </div>
          <CardResumoFinanceiro />
        </section>

        {/* Relatórios (nunca some) */}
        <CardRelatoriosEngajamento />

        {/* Plano/ciclo */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <CardCicloPlano diasRestantes={diasRestantes} tipoPlano={tipoPlano} />
          <CardPlanoAtual tipoPlano={tipoPlano} />
        </div>

        {/* Cards finais - com redirecionamento */}
        <section className="w-full grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
          {/* Próximos Rachas - permanece sem redirecionamento */}
          <CardProximosRachas />

          {/* Mais Assíduos */}
          <Link
            href="/admin/jogadores/ranking-assiduidade"
            className="block hover:scale-[1.025] transition"
            tabIndex={0}
            aria-label="Ranking de Assiduidade"
          >
            <div className="bg-[#23272F] rounded-xl shadow p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <FaMedal className="text-yellow-500 w-6 h-6" />
                <span className="text-lg font-bold text-gray-100">Mais Assíduos</span>
              </div>
              <div className="flex flex-col gap-2 mb-1">
                {carregandoRankingAssiduidade ? (
                  <span className="text-sm text-gray-400">Carregando ranking de presença...</span>
                ) : erroRankingAssiduidade ? (
                  <span className="text-sm text-red-300">
                    Falha ao carregar ranking: {mensagemErroRankingAssiduidade}
                  </span>
                ) : jogadoresAssiduos.length === 0 ? (
                  <span className="text-sm text-gray-400">
                    Nenhum atleta com presença registrada neste período.
                  </span>
                ) : (
                  jogadoresAssiduos.map((jogador) => (
                    <div key={jogador.id ?? jogador.nome} className="flex items-center gap-3">
                      <Image
                        src={jogador.photoUrl}
                        alt={`Jogador assíduo ${jogador.nome} - Fut7Pro`}
                        width={32}
                        height={32}
                        className="rounded-full border border-gray-500 object-cover"
                      />
                      <span className="text-gray-100 font-semibold truncate">{jogador.nome}</span>
                      <span className="ml-auto text-green-400 font-bold">{jogador.jogos}j</span>
                    </div>
                  ))
                )}
              </div>
              <span className="text-xs text-gray-400 mt-2">Ranking por presença</span>
            </div>
          </Link>

          {/* Aniversariantes */}
          <Link
            href="/admin/jogadores/aniversariantes"
            className="block hover:scale-[1.025] transition"
            tabIndex={0}
            aria-label="Aniversariantes"
          >
            <div className="bg-[#23272F] rounded-xl shadow p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <FaBirthdayCake className="text-blue-400 w-6 h-6" />
                <span className="text-lg font-bold text-gray-100">Aniversariantes</span>
              </div>
              <div className="flex flex-col gap-2">
                {carregandoAniversariantes ? (
                  <span className="text-sm text-gray-400">Carregando aniversariantes...</span>
                ) : erroAniversariantes ? (
                  <span className="text-sm text-red-300">
                    Falha ao carregar: {mensagemErroAniversariantes}
                  </span>
                ) : aniversariantes.length === 0 ? (
                  <span className="text-sm text-gray-400">
                    Nenhum aniversário no intervalo selecionado.
                  </span>
                ) : (
                  aniversariantes.map((aniversariante) => (
                    <div key={aniversariante.id} className="flex items-center gap-3">
                      <Image
                        src={aniversariante.photoUrl?.trim() || AVATAR_FALLBACK}
                        alt={`Aniversariante ${aniversariante.name} - Fut7Pro`}
                        width={32}
                        height={32}
                        className="rounded-full border border-gray-500 object-cover"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-gray-100 font-semibold truncate">
                          {aniversariante.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {aniversariante.daysUntil === 0
                            ? "Hoje!"
                            : `em ${aniversariante.daysUntil} dia${
                                aniversariante.daysUntil === 1 ? "" : "s"
                              }`}
                        </span>
                      </div>
                      <span className="ml-auto text-yellow-300 font-bold">
                        {formatShortDate(aniversariante.nextBirthday)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <span className="text-xs text-gray-400 mt-2">Deseje parabéns!</span>
            </div>
          </Link>
        </section>

        {/* Ações rápidas 100% funcional */}
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

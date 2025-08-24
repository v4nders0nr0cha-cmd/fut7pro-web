"use client";

import Head from "next/head";
import BannerNotificacoes from "@/components/admin/BannerNotificacoes";
import CardTimeCampeaoDoDia from "@/components/admin/CardTimeCampeaoDoDia";
import CardCicloPlano from "@/components/admin/CardCicloPlano";
import CardPlanoAtual from "@/components/admin/CardPlanoAtual";
import CardResumoFinanceiro from "@/components/admin/CardResumoFinanceiro";
import CardProximosRachas from "@/components/admin/CardProximosRachas";
import CardAcoesRapidas from "@/components/admin/CardAcoesRapidas";
import CardRelatoriosEngajamento from "@/components/admin/CardRelatoriosEngajamento";
import {
  FaRandom,
  FaUsers,
  FaMoneyBillWave,
  FaMedal,
  FaBirthdayCake,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

// MOCKS — use sempre suas fontes reais depois!
const jogadoresAssiduos = [
  {
    nome: "Bruno Silva",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    jogos: 22,
  },
  {
    nome: "Pedro Alves",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
    jogos: 20,
  },
  {
    nome: "César Souza",
    foto: "/images/jogadores/jogador_padrao_03.jpg",
    jogos: 19,
  },
];
const aniversariantes = [
  {
    nome: "Lucas Reis",
    foto: "/images/jogadores/jogador_padrao_04.jpg",
    data: "07/07",
  },
  {
    nome: "Igor Lima",
    foto: "/images/jogadores/jogador_padrao_05.jpg",
    data: "10/07",
  },
];

const diasRestantes = 5;
const tipoPlano:
  | "trial"
  | "gratuito"
  | "mensal"
  | "mensal-marketing"
  | "anual"
  | "anual-marketing" = "trial";

export default function AdminDashboard() {
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

      <div className="flex w-full flex-col gap-6 px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        {/* Banner só para alertas importantes */}
        <BannerNotificacoes />

        {/* Cards principais */}
        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          <div className="relative">
            <span className="absolute left-3 top-3 z-10 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-300 px-3 py-1 text-xs font-bold text-black shadow">
              🏅 PÓS-JOGO
            </span>
            <CardTimeCampeaoDoDia
              fotoUrl="/images/times/time_campeao_padrao_01.png"
              nomeTime="Time Campeão do Dia"
              editLink="/admin/partidas/time-campeao-do-dia"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3 z-10 rounded-xl bg-gradient-to-r from-blue-800 to-blue-400 px-3 py-1 text-xs font-bold text-white shadow">
              🕒 PRÉ-JOGO
            </span>
            <Link
              href="/admin/partidas/times-do-dia"
              className="group flex min-h-[265px] cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow ring-[#00d3d4] transition hover:scale-[1.025] hover:shadow-lg focus:ring-2"
              aria-label="Times do Dia"
            >
              <FaUsers className="mb-2 h-10 w-10 text-[#00d3d4] transition group-hover:scale-110" />
              <span className="mb-1 text-xl font-bold text-white">
                Times do Dia
              </span>
              <span className="mb-2 text-center text-sm text-gray-400">
                Veja as escalações e confrontos automáticos do racha de hoje.
              </span>
              <span className="mt-auto rounded bg-[#1a1e22] px-4 py-1 text-xs font-semibold text-[#00d3d4]">
                Ver Escalações
              </span>
            </Link>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3 z-10 rounded-xl bg-gradient-to-r from-blue-800 to-blue-400 px-3 py-1 text-xs font-bold text-white shadow">
              🕒 PRÉ-JOGO
            </span>
            <Link
              href="/admin/partidas/sorteio-inteligente"
              className="group flex min-h-[265px] cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow ring-[#ffdf38] transition hover:scale-[1.025] hover:shadow-lg focus:ring-2"
              aria-label="Sorteio Inteligente"
            >
              <FaRandom className="mb-2 h-10 w-10 text-[#ffdf38] transition group-hover:rotate-12" />
              <span className="mb-1 text-xl font-bold text-white">
                Sorteio Inteligente
              </span>
              <span className="mb-2 text-center text-sm text-gray-400">
                Monte os times de forma automática, balanceada e transparente.
              </span>
              <span className="mt-auto rounded bg-[#1a1e22] px-4 py-1 text-xs font-semibold text-[#ffdf38]">
                Acessar Sorteio
              </span>
            </Link>
          </div>
        </section>

        {/* Monetização + Financeiro lado a lado */}
        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative">
            <span className="absolute left-3 top-3 z-10 rounded-xl bg-gradient-to-r from-green-700 to-green-400 px-3 py-1 text-xs font-bold text-white shadow">
              💰 MONETIZE!
            </span>
            <Link
              href="/admin/monetizacao"
              className="group flex min-h-[180px] cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow ring-[#38d957] transition hover:scale-[1.025] hover:shadow-lg focus:ring-2 md:min-h-[210px]"
            >
              <FaMoneyBillWave className="mb-2 h-10 w-10 text-[#38d957] transition group-hover:scale-110" />
              <span className="mb-1 text-center text-xl font-bold text-white">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CardCicloPlano diasRestantes={diasRestantes} tipoPlano={tipoPlano} />
          <CardPlanoAtual tipoPlano={tipoPlano} />
        </div>

        {/* Cards finais - com redirecionamento */}
        <section className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
          {/* Próximos Rachas - permanece sem redirecionamento */}
          <CardProximosRachas />

          {/* Mais Assíduos - neutro e profissional */}
          <Link
            href="/admin/jogadores/ranking-assiduidade"
            className="block transition hover:scale-[1.025]"
            tabIndex={0}
            aria-label="Ranking de Assiduidade"
          >
            <div className="flex h-full flex-col rounded-xl bg-[#23272F] p-5 shadow">
              <div className="mb-3 flex items-center gap-2">
                <FaMedal className="h-6 w-6 text-yellow-500" />
                <span className="text-lg font-bold text-gray-100">
                  Mais Assíduos
                </span>
              </div>
              <div className="mb-1 flex flex-col gap-2">
                {jogadoresAssiduos.map((j, i) => (
                  <div key={j.nome} className="flex items-center gap-3">
                    <Image
                      src={j.foto}
                      alt={`Jogador assíduo ${j.nome} - Fut7Pro`}
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-500"
                    />
                    <span className="truncate font-semibold text-gray-100">
                      {j.nome}
                    </span>
                    <span className="ml-auto font-bold text-green-400">
                      {j.jogos}j
                    </span>
                  </div>
                ))}
              </div>
              <span className="mt-2 text-xs text-gray-400">
                Ranking por presença
              </span>
            </div>
          </Link>

          {/* Aniversariantes - neutro, sem rosa */}
          <Link
            href="/admin/jogadores/aniversariantes"
            className="block transition hover:scale-[1.025]"
            tabIndex={0}
            aria-label="Aniversariantes"
          >
            <div className="flex h-full flex-col rounded-xl bg-[#23272F] p-5 shadow">
              <div className="mb-3 flex items-center gap-2">
                <FaBirthdayCake className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-gray-100">
                  Aniversariantes
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {aniversariantes.map((a) => (
                  <div key={a.nome} className="flex items-center gap-3">
                    <Image
                      src={a.foto}
                      alt={`Aniversariante ${a.nome} - Fut7Pro`}
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-500"
                    />
                    <span className="truncate font-semibold text-gray-100">
                      {a.nome}
                    </span>
                    <span className="ml-auto font-bold text-yellow-300">
                      {a.data}
                    </span>
                  </div>
                ))}
              </div>
              <span className="mt-2 text-xs text-gray-400">
                Deseje parabéns!
              </span>
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

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
import { FaRandom, FaUsers, FaMoneyBillWave, FaMedal, FaBirthdayCake } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

// MOCKS — use sempre suas fontes reais depois!
const jogadoresAssiduos = [
  { nome: "Bruno Silva", foto: "/images/jogadores/jogador_padrao_01.jpg", jogos: 22 },
  { nome: "Pedro Alves", foto: "/images/jogadores/jogador_padrao_02.jpg", jogos: 20 },
  { nome: "César Souza", foto: "/images/jogadores/jogador_padrao_03.jpg", jogos: 19 },
];
const aniversariantes = [
  { nome: "Lucas Reis", foto: "/images/jogadores/jogador_padrao_04.jpg", data: "07/07" },
  { nome: "Igor Lima", foto: "/images/jogadores/jogador_padrao_05.jpg", data: "10/07" },
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

      <div className="flex flex-col gap-6 w-full px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        {/* Banner só para alertas importantes */}
        <BannerNotificacoes />

        {/* Cards principais */}
        <section className="w-full grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-600 to-yellow-300 text-black text-xs font-bold px-3 py-1 rounded-xl shadow">
              🏅 PÓS-JOGO
            </span>
            <CardTimeCampeaoDoDia
              fotoUrl="/images/times/time_campeao_padrao_01.png"
              nomeTime="Time Campeão do Dia"
              editLink="/admin/partidas/time-campeao-do-dia"
            />
          </div>

          <div className="relative">
            <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-800 to-blue-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
              🕒 PRÉ-JOGO
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
              🕒 PRÉ-JOGO
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

          {/* Mais Assíduos - neutro e profissional */}
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
                {jogadoresAssiduos.map((j, i) => (
                  <div key={j.nome} className="flex items-center gap-3">
                    <Image
                      src={j.foto}
                      alt={`Jogador assíduo ${j.nome} - Fut7Pro`}
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-500"
                    />
                    <span className="text-gray-100 font-semibold truncate">{j.nome}</span>
                    <span className="ml-auto text-green-400 font-bold">{j.jogos}j</span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-400 mt-2">Ranking por presença</span>
            </div>
          </Link>

          {/* Aniversariantes - neutro, sem rosa */}
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
                {aniversariantes.map((a) => (
                  <div key={a.nome} className="flex items-center gap-3">
                    <Image
                      src={a.foto}
                      alt={`Aniversariante ${a.nome} - Fut7Pro`}
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-500"
                    />
                    <span className="text-gray-100 font-semibold truncate">{a.nome}</span>
                    <span className="ml-auto text-yellow-300 font-bold">{a.data}</span>
                  </div>
                ))}
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

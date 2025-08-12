// src/app/partidas/detalhes/[id]/page.tsx
"use client";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import { partidasMock } from "@/components/lists/mockPartidas";
import Image from "next/image";
import Link from "next/link";
import type { Partida } from "@/types/partida";

// Função para retornar a logo do time baseado no nome
function getLogoTime(nome: string) {
  switch (nome.toLowerCase()) {
    case "azul":
      return "/images/times/time_padrao_01.png";
    case "laranja":
      return "/images/times/time_padrao_02.png";
    case "verde":
      return "/images/times/time_padrao_03.png";
    case "vermelho":
      return "/images/times/time_padrao_04.png";
    case "hawks":
      return "/images/times/time_padrao_01.png";
    case "panthers":
      return "/images/times/time_padrao_02.png";
    case "wolves":
      return "/images/times/time_padrao_03.png";
    case "trovão":
      return "/images/times/time_padrao_04.png";
    default:
      return "/images/times/time_padrao_01.png";
  }
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Busca a partida pelo ID do mock
  const partida = partidasMock.find((p) => p.id === id);

  if (!partida) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-white">
        <Head>
          <title>Partida não encontrada | Fut7Pro</title>
        </Head>
        <h1 className="text-2xl text-yellow-400 font-bold mb-4">Partida não encontrada</h1>
        <Link
          href="/partidas/historico"
          className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
        >
          Voltar ao Histórico
        </Link>
      </main>
    );
  }

  // MOCK jogadores (ajuste para integrar com dados reais no futuro)
  const mockJogadoresA = ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4", "Jogador 5"];
  const mockJogadoresB = ["Jogador 6", "Jogador 7", "Jogador 8", "Jogador 9", "Jogador 10"];

  return (
    <>
      <Head>
        <title>Detalhes da Partida | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja todos os detalhes da partida entre ${partida.timeA} e ${partida.timeB}: placar, jogadores, local, data e destaques.`}
        />
        <meta
          name="keywords"
          content="fut7, detalhes da partida, futebol 7, racha, jogadores, placar, destaques"
        />
      </Head>
      <main className="flex flex-col w-full min-h-screen items-center text-white">
        <div className="w-full max-w-2xl bg-[#181818] rounded-xl shadow p-6 mt-8 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
            <span className="font-bold text-yellow-400 text-lg">
              {partida.data?.replace(/-/g, "/")}
            </span>
            <span className="text-textoSuave text-sm">
              {partida.local || "Local não informado"}
            </span>
            <span
              className={`px-3 py-1 rounded-xl text-xs w-fit ${partida.finalizada ? "bg-green-700 text-white" : "bg-yellow-700 text-white"}`}
            >
              {partida.finalizada ? "Concluído" : "Em andamento"}
            </span>
          </div>
          {/* Placar */}
          <div className="flex flex-col items-center justify-center gap-1 my-2">
            <div className="flex items-center gap-6 justify-center">
              {/* Time B */}
              <div className="flex flex-col items-center gap-1">
                <Image
                  src={getLogoTime(partida.timeB)}
                  alt={`Logo do time ${partida.timeB} no Fut7Pro`}
                  width={44}
                  height={44}
                  className="rounded"
                />
                <span className="font-bold">{partida.timeB}</span>
              </div>
              <span className="text-3xl md:text-4xl font-extrabold">
                {partida.golsTimeA}
                <span className="mx-2 text-yellow-400 font-bold">x</span>
                {partida.golsTimeB}
              </span>
              {/* Time A */}
              <div className="flex flex-col items-center gap-1">
                <Image
                  src={getLogoTime(partida.timeA)}
                  alt={`Logo do time ${partida.timeA} no Fut7Pro`}
                  width={44}
                  height={44}
                  className="rounded"
                />
                <span className="font-bold">{partida.timeA}</span>
              </div>
            </div>
          </div>
          {/* Listas de jogadores */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <span className="font-bold text-yellow-400 mb-1">Jogadores Time B</span>
              <ul className="text-sm flex flex-col gap-1">
                {mockJogadoresB.map((jogador, i) => (
                  <li key={i} className="text-white">
                    {jogador}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <span className="font-bold text-yellow-400 mb-1">Jogadores Time A</span>
              <ul className="text-sm flex flex-col gap-1">
                {mockJogadoresA.map((jogador, i) => (
                  <li key={i} className="text-white">
                    {jogador}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Área de destaques - pode expandir depois */}
          <div className="w-full mt-3">
            <span className="font-bold text-yellow-400">Destaques da Partida</span>
            <div className="text-sm text-white mt-1">
              Em breve: artilheiros, assistências, melhores em campo...
            </div>
          </div>
          {/* Botão voltar */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.back()}
              className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
            >
              Voltar
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

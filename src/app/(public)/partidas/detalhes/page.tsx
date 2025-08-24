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
      <main className="flex min-h-screen flex-col items-center justify-center text-white">
        <Head>
          <title>Partida não encontrada | Fut7Pro</title>
        </Head>
        <h1 className="mb-4 text-2xl font-bold text-yellow-400">
          Partida não encontrada
        </h1>
        <Link
          href="/partidas/historico"
          className="rounded-lg bg-yellow-400 px-4 py-2 text-base font-bold text-black transition hover:bg-yellow-500"
        >
          Voltar ao Histórico
        </Link>
      </main>
    );
  }

  // MOCK jogadores (ajuste para integrar com dados reais no futuro)
  const mockJogadoresA = [
    "Jogador 1",
    "Jogador 2",
    "Jogador 3",
    "Jogador 4",
    "Jogador 5",
  ];
  const mockJogadoresB = [
    "Jogador 6",
    "Jogador 7",
    "Jogador 8",
    "Jogador 9",
    "Jogador 10",
  ];

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
      <main className="flex min-h-screen w-full flex-col items-center text-white">
        <div className="mt-8 flex w-full max-w-2xl flex-col gap-4 rounded-xl bg-[#181818] p-6 shadow">
          <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span className="text-lg font-bold text-yellow-400">
              {partida.data?.replace(/-/g, "/")}
            </span>
            <span className="text-textoSuave text-sm">
              {partida.local || "Local não informado"}
            </span>
            <span
              className={`w-fit rounded-xl px-3 py-1 text-xs ${partida.finalizada ? "bg-green-700 text-white" : "bg-yellow-700 text-white"}`}
            >
              {partida.finalizada ? "Concluído" : "Em andamento"}
            </span>
          </div>
          {/* Placar */}
          <div className="my-2 flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center gap-6">
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
              <span className="text-3xl font-extrabold md:text-4xl">
                {partida.golsTimeA}
                <span className="mx-2 font-bold text-yellow-400">x</span>
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
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="flex w-full flex-col items-center md:w-1/2">
              <span className="mb-1 font-bold text-yellow-400">
                Jogadores Time B
              </span>
              <ul className="flex flex-col gap-1 text-sm">
                {mockJogadoresB.map((jogador, i) => (
                  <li key={i} className="text-white">
                    {jogador}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full flex-col items-center md:w-1/2">
              <span className="mb-1 font-bold text-yellow-400">
                Jogadores Time A
              </span>
              <ul className="flex flex-col gap-1 text-sm">
                {mockJogadoresA.map((jogador, i) => (
                  <li key={i} className="text-white">
                    {jogador}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Área de destaques - pode expandir depois */}
          <div className="mt-3 w-full">
            <span className="font-bold text-yellow-400">
              Destaques da Partida
            </span>
            <div className="mt-1 text-sm text-white">
              Em breve: artilheiros, assistências, melhores em campo...
            </div>
          </div>
          {/* Botão voltar */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.back()}
              className="rounded-lg bg-yellow-400 px-4 py-2 text-base font-bold text-black transition hover:bg-yellow-500"
            >
              Voltar
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

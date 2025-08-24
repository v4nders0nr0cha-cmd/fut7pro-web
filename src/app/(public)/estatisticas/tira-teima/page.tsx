"use client";

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { atletasMock } from "@/components/lists/mockAtletas";
import Image from "next/image";
import html2canvas from "html2canvas";
import { FaShareAlt } from "react-icons/fa";

const anoAtual = 2025;

type TituloAtleta = {
  descricao: string;
  ano: string | number;
};

type Atleta = (typeof atletasMock)[number] & {
  conquistas?: {
    titulosGrandesTorneios?: TituloAtleta[];
    titulosAnuais?: TituloAtleta[];
    titulosQuadrimestrais?: TituloAtleta[];
  };
};

function adaptarAtletaParaComparador(
  atleta: Atleta | undefined,
  historico: boolean,
) {
  if (!atleta) return undefined;
  const stats = historico
    ? atleta.estatisticas?.historico
    : atleta.estatisticas?.anual?.[anoAtual];

  return {
    ...atleta,
    campeaoDia: stats?.campeaoDia ?? "-",
    gols: stats?.gols ?? "-",
    assistencias: stats?.assistencias ?? "-",
    jogos: stats?.jogos ?? "-",
    mediaVitorias:
      typeof stats?.mediaVitorias === "number"
        ? stats.mediaVitorias.toFixed(2)
        : (stats?.mediaVitorias ?? "-"),
    pontuacao: stats?.pontuacao ?? "-",
    titulosGrandesTorneios: atleta.conquistas?.titulosGrandesTorneios ?? [],
    titulosAnuais: atleta.conquistas?.titulosAnuais ?? [],
    titulosQuadrimestrais: atleta.conquistas?.titulosQuadrimestrais ?? [],
  };
}

type PerfilCardProps = {
  atleta?: ReturnType<typeof adaptarAtletaParaComparador>;
};

function PerfilCard({ atleta }: PerfilCardProps) {
  if (!atleta) {
    return (
      <div className="mx-auto flex h-[430px] w-full max-w-xs flex-col items-center rounded-2xl bg-[#181818] px-6 py-8 shadow-lg">
        <div className="flex h-72 w-full items-center justify-center text-center text-gray-500">
          Selecione um atleta
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[430px] w-full max-w-xs flex-col items-center rounded-2xl bg-[#181818] px-6 py-8 shadow-lg">
      <div className="profile-avatar-share mb-2">
        <Image
          src={atleta.foto}
          alt={atleta.nome}
          width={90}
          height={90}
          style={{
            objectFit: "cover",
            objectPosition: "center",
            width: "90px",
            height: "90px",
            minWidth: "90px",
            minHeight: "90px",
            maxWidth: "90px",
            maxHeight: "90px",
            display: "block",
            background: "#232323",
            borderRadius: "9999px",
          }}
          draggable={false}
        />
      </div>
      <h3 className="mb-1 text-center text-xl font-bold text-yellow-400">
        {atleta.nome}
      </h3>
      <div className="mb-4 text-xs uppercase tracking-wider text-yellow-200">
        {atleta.posicao || "POSIÇÃO"}
      </div>
      <div className="mb-2 grid w-full grid-cols-3 gap-x-4 gap-y-1 text-center text-base">
        <div>
          <span className="block text-lg font-bold text-yellow-400">
            {atleta.campeaoDia}
          </span>
          <span className="mt-1 block text-[11px] text-gray-200">Campeão</span>
        </div>
        <div>
          <span className="block text-lg font-bold text-yellow-400">
            {atleta.gols}
          </span>
          <span className="mt-1 block text-[11px] text-gray-200">Gols</span>
        </div>
        <div>
          <span className="block text-lg font-bold text-yellow-400">
            {atleta.assistencias}
          </span>
          <span className="mt-1 block text-[11px] text-gray-200">
            Assistências
          </span>
        </div>
        <div>
          <span className="block text-lg font-bold text-yellow-400">
            {atleta.jogos}
          </span>
          <span className="mt-1 block text-[11px] text-gray-200">Jogos</span>
        </div>
        <div>
          <span className="block text-lg font-bold text-yellow-400">
            {atleta.mediaVitorias}
          </span>
          <span className="mt-1 block text-[11px] text-gray-200">
            Média Vitórias
          </span>
        </div>
        <div>
          <span className="block text-lg font-bold text-yellow-400">
            {atleta.pontuacao}
          </span>
          <span className="mt-1 block text-[11px] text-gray-200">
            Pontuação
          </span>
        </div>
      </div>
      {/* Títulos */}
      <div className="mt-4 w-full text-left">
        {Array.isArray(atleta.titulosGrandesTorneios) &&
          atleta.titulosGrandesTorneios.length > 0 && (
            <div className="mb-2">
              <span className="flex items-center gap-1 text-[16px] font-bold text-yellow-300">
                <span>🏆</span> Grandes Torneios:
              </span>
              {atleta.titulosGrandesTorneios.map(
                (t: TituloAtleta, i: number) => (
                  <div key={i} className="ml-5 text-[14px] text-gray-200">
                    {t?.descricao}{" "}
                    <span className="text-gray-400">{String(t?.ano)}</span>
                  </div>
                ),
              )}
            </div>
          )}
        {Array.isArray(atleta.titulosAnuais) &&
          atleta.titulosAnuais.length > 0 && (
            <div className="mb-2">
              <span className="flex items-center gap-1 text-[16px] font-bold text-yellow-300">
                <span>🥇</span> Anuais:
              </span>
              {atleta.titulosAnuais.map((t: TituloAtleta, i: number) => (
                <div key={i} className="ml-5 text-[14px] text-gray-200">
                  {t?.descricao}{" "}
                  <span className="text-gray-400">{String(t?.ano)}</span>
                </div>
              ))}
            </div>
          )}
        {Array.isArray(atleta.titulosQuadrimestrais) &&
          atleta.titulosQuadrimestrais.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-[16px] font-bold text-yellow-300">
                <span>🥈</span> Quadrimestrais:
              </span>
              {atleta.titulosQuadrimestrais.map(
                (t: TituloAtleta, i: number) => (
                  <div key={i} className="ml-5 text-[14px] text-gray-200">
                    {t?.descricao}{" "}
                    <span className="text-gray-400">{String(t?.ano)}</span>
                  </div>
                ),
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default function TiraTeimaPage() {
  const searchParams = useSearchParams();
  const atletaQuery = searchParams ? searchParams.get("atleta1") : null;
  const [atletaA, setAtletaA] = useState<string>("");
  const [atletaB, setAtletaB] = useState<string>("");
  const [buscaA, setBuscaA] = useState("");
  const [buscaB, setBuscaB] = useState("");
  const [historico, setHistorico] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (atletaQuery && atletasMock.some((a) => a.slug === atletaQuery)) {
      setAtletaA(atletaQuery);
    }
  }, [atletaQuery]);

  const atletasFiltradosA = atletasMock.filter((a) =>
    a.nome.toLowerCase().includes(buscaA.toLowerCase()),
  );
  const atletasFiltradosB = atletasMock.filter((a) =>
    a.nome.toLowerCase().includes(buscaB.toLowerCase()),
  );

  const atletaSelecionadoA = atletasMock.find((a) => a.slug === atletaA);
  const atletaSelecionadoB = atletasMock.find((a) => a.slug === atletaB);
  const atletaObjA = adaptarAtletaParaComparador(atletaSelecionadoA, historico);
  const atletaObjB = adaptarAtletaParaComparador(atletaSelecionadoB, historico);

  async function handleShare() {
    if (!shareRef.current) return;
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 150));
    shareRef.current.style.width = "1200px";
    shareRef.current.style.maxWidth = "1200px";
    const canvas = await html2canvas(shareRef.current, {
      backgroundColor: "#181818",
      scale: 2,
      useCORS: true,
      windowWidth: 1200,
    });
    shareRef.current.style.width = "";
    shareRef.current.style.maxWidth = "";
    setIsExporting(false);
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "comparativo-atletas.png";
    link.click();
  }

  return (
    <>
      <Head>
        <title>Tira-teima (Comparador) | Estatísticas</title>
        <meta
          name="description"
          content="Compare lado a lado dois jogadores do seu racha. Veja desempenho, estatísticas e conquistas de cada atleta. Ferramenta exclusiva para comparação de perfis de jogadores de futebol 7."
        />
        <meta
          name="keywords"
          content="Comparador, Tira Teima, Estatísticas, Jogadores, Futebol 7, Racha, Comparação de atletas"
        />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-fundo pb-12 pt-12 text-white">
        {/* Filtro de estatísticas */}
        <div className="mb-8 flex w-full flex-col items-center justify-center gap-4 md:flex-row">
          <span className="mb-2 text-xl font-bold text-yellow-400 md:mb-0 md:mr-2">
            Estatísticas:
          </span>
          <button
            className={`rounded border px-4 py-2 text-lg font-semibold transition ${
              !historico
                ? "border-yellow-400 bg-yellow-400 text-black"
                : "border-yellow-400 bg-zinc-900 text-yellow-300"
            }`}
            onClick={() => setHistorico(false)}
          >
            Temporada Atual
          </button>
          <button
            className={`rounded border px-4 py-2 text-lg font-semibold transition ${
              historico
                ? "border-yellow-400 bg-yellow-400 text-black"
                : "border-yellow-400 bg-zinc-900 text-yellow-300"
            }`}
            onClick={() => setHistorico(true)}
          >
            Todo o Histórico
          </button>
        </div>

        {/* Cards comparador */}
        <div
          ref={shareRef}
          data-share-card
          className={`relative flex w-full max-w-[1200px] flex-col items-center gap-0 px-0 py-4 md:flex-row md:items-stretch md:justify-center md:gap-0 ${
            isExporting ? "no-vs-effect" : ""
          }`}
          style={{ background: "#181818" }}
        >
          <div className="flex min-w-[350px] max-w-[430px] flex-1 flex-col items-center">
            <label className="mb-1 mt-2 text-lg font-bold text-yellow-300">
              Jogador 1
            </label>
            <input
              className="mb-3 w-full rounded border border-yellow-400 bg-zinc-800 px-3 py-2 text-white outline-none"
              type="text"
              placeholder="Buscar atleta..."
              value={buscaA}
              onChange={(e) => {
                setBuscaA(e.target.value);
                if (atletasFiltradosA.length === 1 && atletasFiltradosA[0])
                  setAtletaA(atletasFiltradosA[0].slug);
              }}
              onBlur={() => {
                if (atletasFiltradosA.length === 1 && atletasFiltradosA[0])
                  setAtletaA(atletasFiltradosA[0].slug);
              }}
            />
            <PerfilCard atleta={atletaObjA} />
          </div>

          {/* VS centralizado */}
          <div className="my-6 flex min-h-[90px] w-full flex-row items-center justify-center md:my-0 md:min-h-[430px] md:w-[180px]">
            <span
              className="vs-animated relative z-10 select-none px-3 text-[56px] font-extrabold leading-[1.15] md:text-[90px]"
              style={{
                display: "inline-block",
                width: "auto",
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              VS
            </span>
          </div>

          <div className="flex min-w-[350px] max-w-[430px] flex-1 flex-col items-center">
            <label className="mb-1 mt-2 text-lg font-bold text-yellow-300">
              Jogador 2
            </label>
            <input
              className="mb-3 w-full rounded border border-yellow-400 bg-zinc-800 px-3 py-2 text-white outline-none"
              type="text"
              placeholder="Buscar atleta..."
              value={buscaB}
              onChange={(e) => {
                setBuscaB(e.target.value);
                if (atletasFiltradosB.length === 1 && atletasFiltradosB[0])
                  setAtletaB(atletasFiltradosB[0].slug);
              }}
              onBlur={() => {
                if (atletasFiltradosB.length === 1 && atletasFiltradosB[0])
                  setAtletaB(atletasFiltradosB[0].slug);
              }}
            />
            <PerfilCard atleta={atletaObjB} />
          </div>
        </div>

        {/* Botão compartilhar */}
        <div className="mt-8 flex w-full justify-center">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-8 py-4 text-xl font-bold text-black shadow transition-all hover:bg-yellow-300"
          >
            <FaShareAlt size={22} />
            Compartilhar
          </button>
        </div>

        {/* CSS efeito VS e fix no print + fix alinhamento avatar */}
        <style jsx global>{`
          .vs-animated {
            background: linear-gradient(
              120deg,
              #fff600 0%,
              #ffed4a 35%,
              #fff 50%,
              #ffed4a 65%,
              #fff600 100%
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: #ffe600;
            display: inline-block;
            background-size: 300% 300%;
            animation: reflexvs 2.2s infinite linear;
          }
          @keyframes reflexvs {
            0% {
              background-position: 200% 0%;
            }
            100% {
              background-position: 0% 0%;
            }
          }
          .no-vs-effect .vs-animated {
            background: none !important;
            -webkit-background-clip: initial !important;
            -webkit-text-fill-color: #ffe600 !important;
            color: #ffe600 !important;
            animation: none !important;
          }
          [data-share-card] .profile-avatar-share {
            width: 90px !important;
            height: 90px !important;
            min-width: 90px !important;
            min-height: 90px !important;
            max-width: 90px !important;
            max-height: 90px !important;
            overflow: hidden !important;
            border-radius: 9999px !important;
            border: 4px solid #ffe600 !important;
            box-sizing: border-box !important;
            background: #232323 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          [data-share-card] .profile-avatar-share img {
            width: 90px !important;
            height: 90px !important;
            min-width: 90px !important;
            min-height: 90px !important;
            max-width: 90px !important;
            max-height: 90px !important;
            object-fit: cover !important;
            object-position: center !important;
            border-radius: 9999px !important;
            background: #232323 !important;
            box-sizing: border-box !important;
            display: block !important;
          }
        `}</style>
      </main>
    </>
  );
}

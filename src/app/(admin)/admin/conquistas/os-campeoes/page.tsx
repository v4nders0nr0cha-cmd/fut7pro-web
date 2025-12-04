"use client";

import Head from "next/head";
import { useState } from "react";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import { campeoesAno } from "@/components/lists/mockCampeoesAno";
import { melhoresPorPosicao } from "@/components/lists/mockMelhoresPorPosicao";
import type { QuadrimestresAno } from "@/types/estatisticas";

// --- MOCK VISUAL (se não houver dados reais no ano) ---
const mockQuadrimestresAno: QuadrimestresAno = {
  "1º QUADRIMESTRE": [
    { titulo: "Artilheiro", nome: "Matheus Silva", icone: "⚽", slug: "matheus-silva" },
    { titulo: "Meia", nome: "Lucas Rocha", icone: "🥇", slug: "lucas-rocha" },
    { titulo: "Melhor do Quadrimestre", nome: "Vitão Beta", icone: "🏆", slug: "vitao-beta" },
  ],
  "2º QUADRIMESTRE": [
    { titulo: "Artilheiro", nome: "João Alpha", icone: "⚽", slug: "joao-alpha" },
    { titulo: "Meia", nome: "Cris Mid", icone: "🥇", slug: "cris-mid" },
  ],
  "3º QUADRIMESTRE": [],
};

const ordemCampeoes = ["Melhor do Ano", "Artilheiro do Ano", "Maestro do Ano", "Campeão do Ano"];
const ordemPosicoes = ["Atacante do Ano", "Meia do Ano", "Zagueiro do Ano", "Goleiro do Ano"];
const prioridadeQuadrimestre = [
  "Melhor do Quadrimestre",
  "Artilheiro",
  "Maestro",
  "Campeão do Quadrimestre",
  "Atacante",
  "Meia",
  "Zagueiro",
  "Goleiro",
];

// --- Dados e seleção do ano ---
const anosDisponiveis = Array.from(new Set(campeoesAno.map((c) => c.ano))).sort((a, b) => b - a);
const anoSelecionado = anosDisponiveis[0];

const campeoesDoAno = ordemCampeoes
  .map((titulo) => campeoesAno.find((c) => c.ano === anoSelecionado && c.titulo === titulo))
  .filter(Boolean);

campeoesDoAno.forEach((c) => {
  if (c && c.titulo === "Maestro do Ano") {
    c.icone = "/images/icons/chuteira-de-ouro.png";
  }
});

const melhoresPosicaoDoAno = melhoresPorPosicao
  .filter((p) => p.ano === anoSelecionado)
  .sort((a, b) => ordemPosicoes.indexOf(a.posicao) - ordemPosicoes.indexOf(b.posicao));

const quadrimestresOrdenados: QuadrimestresAno = {};
Object.keys(mockQuadrimestresAno).forEach((periodo) => {
  quadrimestresOrdenados[periodo] = [...(mockQuadrimestresAno[periodo] || [])].sort(
    (a, b) => prioridadeQuadrimestre.indexOf(a.titulo) - prioridadeQuadrimestre.indexOf(b.titulo)
  );
});

export default function OsCampeoesAdminPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  function handleFinalizarTemporada() {
    setModalOpen(true);
  }

  function handleConfirmarFinalizar() {
    setModalOpen(false);
    setFinalizando(true);
    setTimeout(() => {
      setFinalizando(false);
      setFinalizado(true);
    }, 2000);
  }

  function handleCloseFestivo() {
    setFinalizado(false);
  }

  return (
    <>
      <Head>
        <title>Os Campeões (Admin) | Fut7Pro</title>
        <meta
          name="description"
          content="Finalize a temporada e aplique os ícones de conquistas nos campeões do ano e dos quadrimestres no Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7pro, admin, campeões, ranking, temporada, conquistas, futebol"
        />
      </Head>

      <main className="bg-fundo text-white min-h-screen pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        {/* Efeito finalização */}
        {finalizado && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
            <svg className="mb-8" width="120" height="120">
              <g>
                <circle cx="20" cy="60" r="8" fill="#FFD700">
                  <animate
                    attributeName="cy"
                    from="60"
                    to="110"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="60" cy="20" r="7" fill="#FF00C3">
                  <animate
                    attributeName="cy"
                    from="20"
                    to="110"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="100" cy="40" r="6" fill="#00D2FF">
                  <animate
                    attributeName="cy"
                    from="40"
                    to="110"
                    dur="1.1s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="30" cy="30" r="6" fill="#6FFF00">
                  <animate
                    attributeName="cy"
                    from="30"
                    to="110"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </svg>
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3 text-center animate-bounce">
              🏆 Temporada Finalizada!
            </div>
            <div className="text-center text-gray-200 mb-4 max-w-xl">
              Os campeões do ano e do quadrimestre atual foram registrados.
              <br />
              Todos os ícones de conquistas já foram aplicados nos perfis dos atletas vencedores.
            </div>
            <button
              className="mt-3 px-8 py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg shadow-lg border-2 border-yellow-300 hover:bg-yellow-600"
              onClick={handleCloseFestivo}
            >
              Fechar
            </button>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mt-8 mb-2">
            Os Campeões (Gestão)
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Finalize a temporada para gerar os campeões do ano.
            <br />
            Campeões por quadrimestre são calculados automaticamente ao final de cada período.
            <br />
            <span className="text-yellow-300">
              • Os ícones de conquistas serão aplicados automaticamente nos perfis dos atletas.
            </span>
          </p>

          <div className="flex justify-center mb-10">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-3 rounded-2xl shadow-lg border-2 border-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleFinalizarTemporada}
              disabled={finalizando}
            >
              {finalizando ? "Finalizando..." : "Finalizar Temporada"}
            </button>
          </div>

          {/* Modal de confirmação */}
          {modalOpen && (
            <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center">
              <div className="bg-zinc-900 border-2 border-yellow-400 rounded-2xl p-8 max-w-md w-full flex flex-col items-center shadow-2xl">
                <div className="text-yellow-400 text-2xl mb-3 font-bold flex items-center gap-2">
                  ⚠️ Encerrar Temporada?
                </div>
                <div className="text-gray-200 text-center mb-6 text-sm">
                  <b>Esta ação irá:</b>
                  <br />
                  - Encerrar o ano e o quadrimestre atual
                  <br />
                  - Registrar os campeões
                  <br />
                  - Aplicar os ícones nos perfis dos vencedores
                  <br />
                  <br />
                  <span className="text-yellow-300 font-semibold">
                    Esta operação é irreversível.
                    <br />
                    Deseja finalizar agora?
                  </span>
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    className="px-6 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 font-semibold text-base"
                    onClick={() => setModalOpen(false)}
                    disabled={finalizando}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-6 py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 font-bold text-base shadow-lg border border-yellow-400"
                    onClick={handleConfirmarFinalizar}
                    disabled={finalizando}
                  >
                    {finalizando ? "Finalizando..." : "Finalizar Agora"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Campeões do Ano */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">Campeões do Ano</h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
              {campeoesDoAno.map((c) =>
                c ? (
                  <CampeaoAnoCard
                    key={c.titulo}
                    titulo={c.titulo}
                    nome={c.nome}
                    image={c.image}
                    valor={c.valor}
                    icone={c.icone}
                    href={c.href}
                    slug={c.slug}
                    temporario={c.temporario}
                  />
                ) : null
              )}
            </div>
          </section>

          {/* Melhores por posição */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              Melhores por Posição
            </h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
              {melhoresPosicaoDoAno.map((c) =>
                c ? (
                  <CampeaoAnoCard
                    key={c.posicao}
                    titulo={c.posicao}
                    nome={c.nome}
                    image={c.image}
                    valor={c.valor}
                    icone={c.icone}
                    href={c.href}
                    slug={c.slug}
                    temporario={c.temporario}
                  />
                ) : null
              )}
            </div>
          </section>

          {/* Quadrimestres */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              Campeões por Quadrimestre
            </h2>
            <QuadrimestreGrid dados={quadrimestresOrdenados} />
          </section>
        </div>
      </main>
    </>
  );
}

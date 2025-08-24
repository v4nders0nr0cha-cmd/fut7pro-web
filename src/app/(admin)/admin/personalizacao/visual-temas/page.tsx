"use client";

import Head from "next/head";
import { useState } from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";

// Paletas de cores - nomes premium, sem times
const PALETAS_MOCK = [
  {
    id: "dourado-branco",
    nome: "Dourado & Branco",
    descricao: "Dourado, branco e preto",
    cores: ["#FFD600", "#ffffff", "#191c22"],
    logo: "/images/themes/theme_dourado_branco.png",
  },
  {
    id: "azul-royal",
    nome: "Azul Royal",
    descricao: "Azul royal, azul claro e preto",
    cores: ["#004D98", "#A5D8FF", "#191c22"],
    logo: "/images/themes/theme_azul_royal.png",
  },
  {
    id: "vermelho-rubi",
    nome: "Vermelho Rubi",
    descricao: "Vermelho rubi, dourado e preto",
    cores: ["#C1121F", "#FFD600", "#191c22"],
    logo: "/images/themes/theme_vermelho_rubi.png",
  },
  {
    id: "preto-classico",
    nome: "Preto Clássico",
    descricao: "Preto, branco e dourado",
    cores: ["#191c22", "#ffffff", "#FFD600"],
    logo: "/images/themes/theme_preto_classico.png",
  },
  {
    id: "verde-esmeralda",
    nome: "Verde Esmeralda",
    descricao: "Verde esmeralda, verde claro e preto",
    cores: ["#129E57", "#A9F5A9", "#191c22"],
    logo: "/images/themes/theme_verde_esmeralda.png",
  },
  {
    id: "laranja-flame",
    nome: "Laranja Flame",
    descricao: "Laranja flame, dourado e preto",
    cores: ["#FF8500", "#FFD600", "#191c22"],
    logo: "/images/themes/theme_laranja_flame.png",
  },
];

type Paleta = (typeof PALETAS_MOCK)[number];

export default function VisualTemasPage() {
  // Nunca passe generic! Tipo é inferido.
  const [temaAtivo, setTemaAtivo] = useState(PALETAS_MOCK[0]);
  const [salvo, setSalvo] = useState(false);

  // Função 100% segura, nunca retorna undefined
  function getPaletaById(paletaId: string): Paleta {
    for (const paleta of PALETAS_MOCK) {
      if (paleta.id === paletaId) return paleta;
    }
    return PALETAS_MOCK[0];
  }

  function handleSelecionarTema(paletaId: string) {
    setTemaAtivo(getPaletaById(paletaId));
    setSalvo(false);
  }

  function handleSalvar() {
    setSalvo(true);
  }

  return (
    <>
      <Head>
        <title>Visual & Temas do Racha | Fut7Pro Painel Admin</title>
        <meta
          name="description"
          content="Escolha e personalize o tema visual do seu racha no Fut7Pro. Paletas de cores sofisticadas, esportivas e exclusivas."
        />
        <meta
          name="keywords"
          content="Fut7Pro, temas, paleta de cores, visual, personalização, painel admin, futebol 7, SaaS"
        />
      </Head>
      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-center text-2xl font-bold text-white md:text-3xl">
          Visual & Temas do Racha
        </h1>
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-[#191c22] p-6 shadow-lg">
          <p className="mb-2 text-center text-base text-gray-200">
            Escolha uma paleta de cores para personalizar o visual do seu racha.
            <br />
            Todas as telas do seu painel e site ficarão com a identidade
            escolhida.
          </p>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {PALETAS_MOCK.map((paleta) => {
              // Borda especial para Preto Clássico
              const borderColor =
                paleta.id === "preto-classico" ? "#B1B1B1" : paleta.cores[0];
              const isAtivo = temaAtivo.id === paleta.id;
              return (
                <button
                  key={paleta.id}
                  className="flex flex-col items-center gap-3 rounded-2xl border-2 p-4 shadow outline-none transition"
                  style={{
                    borderColor: borderColor,
                    background: isAtivo ? "#23272e" : "#17191f",
                    boxShadow: isAtivo
                      ? `0 0 0 3px ${borderColor}55`
                      : undefined,
                  }}
                  onClick={() => handleSelecionarTema(paleta.id)}
                  aria-label={`Selecionar tema ${paleta.nome}`}
                  type="button"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2"
                    style={{ borderColor: borderColor, background: "#000" }}
                  >
                    <Image
                      src={paleta.logo}
                      alt={`Paleta ${paleta.nome} - visual racha de futebol 7 Fut7Pro`}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-white">
                      {paleta.nome}
                    </span>
                    <span className="text-sm text-gray-300">
                      {paleta.descricao}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {paleta.cores.map((cor, idx) => (
                      <span
                        key={idx}
                        className="h-6 w-6 rounded-full border-2 border-[#23272e] shadow"
                        style={{ background: cor }}
                        aria-label={`Cor ${cor}`}
                      />
                    ))}
                  </div>
                  {isAtivo && (
                    <div
                      className="mt-2 flex items-center gap-2 text-sm font-semibold"
                      style={{ color: borderColor }}
                    >
                      <FaCheckCircle /> Selecionado
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button
            className="mt-6 rounded-lg bg-[#FFD600] px-8 py-3 font-bold text-black shadow transition hover:scale-105 active:scale-95"
            onClick={handleSalvar}
            disabled={salvo}
          >
            Salvar Tema
          </button>
          {salvo && (
            <div className="mt-2 flex items-center gap-2 text-green-400">
              <FaCheckCircle />
              <span className="text-sm font-medium">
                Tema salvo com sucesso!
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

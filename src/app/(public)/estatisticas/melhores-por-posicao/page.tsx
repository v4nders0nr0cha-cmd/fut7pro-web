"use client";

import Head from "next/head";
import Link from "next/link";
import { FaFutbol, FaHandsHelping, FaShieldAlt } from "react-icons/fa";

const cards = [
  {
    label: "Atacantes",
    icon: (
      <FaFutbol className="text-4xl text-yellow-400" aria-label="Atacante" />
    ),
    href: "/estatisticas/melhores-por-posicao/atacantes",
  },
  {
    label: "Meias",
    icon: (
      <FaHandsHelping className="text-4xl text-green-400" aria-label="Meia" />
    ),
    href: "/estatisticas/melhores-por-posicao/meias",
  },
  {
    label: "Zagueiros",
    icon: (
      <FaShieldAlt className="text-4xl text-blue-400" aria-label="Zagueiro" />
    ),
    href: "/estatisticas/melhores-por-posicao/zagueiros",
  },
  {
    label: "Goleiros",
    icon: (
      <span className="text-4xl" role="img" aria-label="Goleiro">
        🧤
      </span>
    ),
    href: "/estatisticas/melhores-por-posicao/goleiros",
  },
];

export default function MelhoresPorPosicaoPage() {
  return (
    <>
      <Head>
        <title>Melhores por Posição | Estatísticas</title>
        <meta
          name="description"
          content="Ranking dos melhores jogadores por posição: atacante, meia, zagueiro e goleiro. Veja quem são os destaques de cada função em qualquer racha de futebol 7."
        />
        <meta
          name="keywords"
          content="Melhores por Posição, Ranking, Atacantes, Meias, Zagueiros, Goleiros, Futebol 7, Estatísticas, Racha"
        />
      </Head>
      <main className="min-h-screen w-full bg-fundo pb-16 pt-6 text-white">
        <h1 className="mb-6 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
          Melhores por Posição
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-gray-400">
          Escolha abaixo a posição que você deseja acompanhar. Este ranking
          especial mostra a disputa entre jogadores que atuam na mesma posição:{" "}
          <b>Atacantes, Meias, Zagueiros e Goleiros</b>.<br />O destaque vai
          para quem soma mais pontos em cada função, valorizando o desempenho de
          cada atleta na sua especialidade. Torne-se referência e acompanhe quem
          são os grandes nomes em cada setor do campo!
        </p>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl bg-[#232323] px-2 py-8 text-center shadow-md transition-all hover:shadow-[0_0_12px_2px_#FFCC00]"
            >
              {card.icon}
              <span className="text-lg font-bold">{card.label}</span>
              <span className="text-sm text-gray-400">Ver ranking</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

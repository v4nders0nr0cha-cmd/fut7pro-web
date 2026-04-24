"use client";

import Head from "next/head";
import Link from "next/link";
import { FaFutbol, FaHandsHelping, FaShieldAlt } from "react-icons/fa";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import PageHelp from "@/components/public/PageHelp";

const cards = [
  {
    label: "Atacantes",
    icon: <FaFutbol className="text-brand text-4xl" aria-label="Atacante" />,
    href: "/estatisticas/melhores-por-posicao/atacantes",
  },
  {
    label: "Meias",
    icon: <FaHandsHelping className="text-green-400 text-4xl" aria-label="Meia" />,
    href: "/estatisticas/melhores-por-posicao/meias",
  },
  {
    label: "Zagueiros",
    icon: <FaShieldAlt className="text-blue-400 text-4xl" aria-label="Zagueiro" />,
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
  const { publicHref } = usePublicLinks();

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
      <main className="min-h-screen bg-fundo text-white pb-16 pt-6 w-full">
        <PageHelp
          title="Melhores por Posição"
          headingLevel="h1"
          summary="Rankings separados por função para comparar atletas da mesma posição."
          className="mb-8"
          detailsTitle="Como funciona o ranking por posição"
          details={
            <>
              <p>
                Este ranking separa a disputa por posição: atacantes, meias, zagueiros e goleiros.
              </p>
              <p>
                Cada lista valoriza a pontuação dos atletas dentro da própria função, facilitando a
                comparação entre jogadores com papéis semelhantes no campo.
              </p>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mx-auto">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={publicHref(card.href)}
              className="bg-[#232323] flex flex-col items-center gap-3 rounded-2xl py-8 px-2 shadow-md hover:shadow-[0_0_12px_2px_var(--brand)] transition-all cursor-pointer text-center"
            >
              {card.icon}
              <span className="font-bold text-lg">{card.label}</span>
              <span className="text-sm text-gray-400">Ver ranking</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

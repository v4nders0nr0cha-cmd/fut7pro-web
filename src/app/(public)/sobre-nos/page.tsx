"use client";

import Link from "next/link";
import Head from "next/head";
import {
  FaBookOpen,
  FaGavel,
  FaBirthdayCake,
  FaHandshake,
  FaPhoneAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { rachaConfig } from "@/config/racha.config";
import { usePublicLinks } from "@/hooks/usePublicLinks";

export default function SobreNosPage() {
  const { publicHref, publicSlug } = usePublicLinks();
  const { racha } = useRachaPublic(publicSlug);

  const mostrarPrestacaoDeContas = !!racha?.financeiroVisivel;

  const cards = [
    {
      href: "/sobre-nos/nossa-historia",
      icon: <FaBookOpen className="text-3xl text-brand" />,
      title: "Nossa Historia",
      desc: "Conheca nossa origem, missao e os principais marcos.",
    },
    {
      href: "/sobre-nos/estatuto",
      icon: <FaGavel className="text-3xl text-brand" />,
      title: "Estatuto",
      desc: "Regras e diretrizes internas que norteiam o nosso racha.",
    },
    {
      href: "/sobre-nos/aniversariantes",
      icon: <FaBirthdayCake className="text-3xl text-brand" />,
      title: "Aniversariantes",
      desc: "Veja quem faz aniversario no mes e acesse o perfil dos atletas.",
    },
    {
      href: "/sobre-nos/nossos-parceiros",
      icon: <FaHandshake className="text-3xl text-brand" />,
      title: "Nossos Parceiros",
      desc: "Conheca nossos patrocinadores e apoiadores.",
    },
    {
      href: "/sobre-nos/contatos",
      icon: <FaPhoneAlt className="text-3xl text-brand" />,
      title: "Contatos",
      desc: "Entre em contato com nossos administradores.",
    },
  ];

  if (mostrarPrestacaoDeContas) {
    cards.push({
      href: "/sobre-nos/prestacao-de-contas",
      icon: <FaFileInvoiceDollar className="text-3xl text-brand" />,
      title: "Prestacao de Contas",
      desc: "Transparencia financeira: entradas e despesas do racha.",
    });
  }

  return (
    <>
      <Head>
        <title>Sobre Nos | {racha?.nome || rachaConfig.nome}</title>
        <meta
          name="description"
          content="Saiba tudo sobre nosso futebol entre amigos: historia, missao, regras, aniversariantes, parceiros, administracao, prestacao de contas e muito mais."
        />
        <meta
          name="keywords"
          content="fut7pro, sobre nos, historia, estatuto, aniversariantes, parceiros, contatos, administracao, prestacao de contas, futebol 7, racha, futebol amador, ranking, plataforma de racha"
        />
      </Head>
      <main className="w-full min-h-screen flex flex-col items-center py-10 pb-8 bg-fundo">
        <h1 className="mb-3 text-3xl md:text-4xl font-extrabold text-brand text-center leading-tight drop-shadow-sm">
          Sobre Nos
        </h1>
        <p className="mb-10 text-base md:text-lg text-gray-300 text-center max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed font-medium">
          Conheca mais sobre nosso futebol entre amigos: nossa historia, regras, aniversariantes,
          parceiros e todas as informacoes importantes do racha.
        </p>
        <section className="w-full max-w-5xl">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={publicHref(card.href)}
                className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 flex flex-col items-start hover:border-brand hover:shadow-lg hover:scale-[1.03] transition-all"
              >
                <div className="mb-3">{card.icon}</div>
                <div className="font-bold text-brand-soft text-xl mb-1 break-words">
                  {card.title}
                </div>
                <div className="text-white text-sm break-words">{card.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

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
import { useRacha as useRachaContext } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

export default function SobreNosPage() {
  const { rachaId } = useRachaContext();
  const { racha, isLoading } = useRachaPublic(rachaId);

  const mostrarPrestacaoDeContas = !!racha?.financeiroVisivel;

  const cards = [
    {
      href: "/sobre-nos/nossa-historia",
      icon: <FaBookOpen className="text-3xl text-yellow-400" />,
      title: "Nossa História",
      desc: "Conheça nossa origem, missão e os principais marcos.",
    },
    {
      href: "/sobre-nos/estatuto",
      icon: <FaGavel className="text-3xl text-yellow-400" />,
      title: "Estatuto",
      desc: "Regras e diretrizes internas que norteiam o nosso racha.",
    },
    {
      href: "/sobre-nos/aniversariantes",
      icon: <FaBirthdayCake className="text-3xl text-yellow-400" />,
      title: "Aniversariantes",
      desc: "Veja quem faz aniversário no mês e acesse o perfil dos atletas.",
    },
    {
      href: "/sobre-nos/nossos-parceiros",
      icon: <FaHandshake className="text-3xl text-yellow-400" />,
      title: "Nossos Parceiros",
      desc: "Conheça nossos patrocinadores e apoiadores.",
    },
    {
      href: "/sobre-nos/contatos",
      icon: <FaPhoneAlt className="text-3xl text-yellow-400" />,
      title: "Contatos",
      desc: "Entre em contato com nossos administradores.",
    },
  ];

  if (mostrarPrestacaoDeContas) {
    cards.push({
      href: "/sobre-nos/prestacao-de-contas",
      icon: <FaFileInvoiceDollar className="text-3xl text-yellow-400" />,
      title: "Prestação de Contas",
      desc: "Transparência financeira: entradas e despesas do racha.",
    });
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-10 pb-8 bg-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-300">Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sobre Nós | {racha?.nome || rachaConfig.nome}</title>
        <meta
          name="description"
          content="Saiba tudo sobre nosso futebol entre amigos: história, missão, regras, aniversariantes, parceiros, administração, prestação de contas e muito mais. Plataforma para racha, futebol amador, ranking e organização."
        />
        <meta
          name="keywords"
          content="fut7pro, sobre nós, história, estatuto, aniversariantes, parceiros, contatos, administração, prestação de contas, futebol 7, racha, futebol amador, ranking, plataforma de racha"
        />
      </Head>
      <main className="w-full min-h-screen flex flex-col items-center py-10 pb-8 bg-fundo">
        {/* TÍTULO PRINCIPAL PADRÃO */}
        <h1 className="mb-3 text-3xl md:text-4xl font-extrabold text-yellow-400 text-center leading-tight drop-shadow-sm">
          Sobre Nós
        </h1>
        {/* DESCRIÇÃO PADRÃO */}
        <p className="mb-10 text-base md:text-lg text-gray-300 text-center max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed font-medium">
          Conheça mais sobre nosso futebol entre amigos: nossa história, regras, aniversariantes,
          parceiros e todas as informações importantes do racha.
        </p>
        <section className="w-full max-w-5xl">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 flex flex-col items-start hover:border-yellow-400 hover:shadow-lg hover:scale-[1.03] transition-all"
              >
                <div className="mb-3">{card.icon}</div>
                <div className="font-bold text-yellow-300 text-xl mb-1 break-words">
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

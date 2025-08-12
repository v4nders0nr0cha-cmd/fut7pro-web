"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

// SEO config
const seo = {
  title: "Nossos Parceiros | Fut7Pro – Patrocinadores e apoio ao futebol 7",
  description:
    "Conheça os patrocinadores do Fut7Pro: empresas que apoiam nosso racha com descontos, doações e parcerias. Sua marca também pode aparecer aqui!",
  keywords:
    "parceiros fut7pro, patrocinadores futebol 7, apostas esportivas, descontos racha, apoio esporte, fut7pro parceiros",
  url: "https://fut7pro.com.br/sobre-nos/nossos-parceiros",
};

// Mock 10 patrocinadores
const parceirosMock = [
  {
    nome: "Fut7Pro",
    logo: "/images/logos/logo_fut7pro.png",
    categoria: "Apoiador Institucional",
    descricao: "Plataforma oficial de gestão de rachas e estatísticas do Futebol 7 no Brasil.",
    link: "https://fut7pro.com.br",
    destaque: true,
  },
  {
    nome: "Arena Society",
    logo: "/images/patrocinadores/patrocinador_01.png",
    categoria: "Campo de Futebol",
    descricao: "O melhor gramado para futebol entre amigos.",
    link: "#",
  },
  {
    nome: "Loja Bola de Ouro",
    logo: "/images/patrocinadores/patrocinador_02.png",
    categoria: "Loja Esportiva",
    descricao: "Uniformes e materiais esportivos com descontos exclusivos.",
    link: "#",
  },
  {
    nome: "Bar do Goleiro",
    logo: "/images/patrocinadores/patrocinador_03.png",
    categoria: "Bar e Restaurante",
    descricao: "Ponto de encontro pós-rachão, cerveja sempre gelada!",
    link: "#",
  },
  {
    nome: "Clínica Movimente-se",
    logo: "/images/patrocinadores/patrocinador_04.png",
    categoria: "Fisioterapia",
    descricao: "Desconto em reabilitação esportiva para os jogadores.",
    link: "#",
  },
  {
    nome: "Nutrishop Saúde",
    logo: "/images/patrocinadores/patrocinador_05.png",
    categoria: "Suplementos",
    descricao: "Linha completa de suplementos para melhorar sua performance.",
    link: "#",
  },
  {
    nome: "BetEsporte7",
    logo: "/images/patrocinadores/patrocinador_10.png",
    categoria: "Apostas Esportivas",
    descricao: "Aposte nos seus palpites e ganhe bônus. +18 apenas.",
    link: "#",
  },
  {
    nome: "Tec Print Uniformes",
    logo: "/images/patrocinadores/patrocinador_06.png",
    categoria: "Uniformes Esportivos",
    descricao: "Personalização de uniformes para o seu time.",
    link: "#",
  },
  {
    nome: "Água Cristal",
    logo: "/images/patrocinadores/patrocinador_07.png",
    categoria: "Distribuidora de Água",
    descricao: "Hidratação garantida para todos os jogos.",
    link: "#",
  },
  {
    nome: "Supermercado Econômico",
    logo: "/images/patrocinadores/patrocinador_09.png",
    categoria: "Supermercado",
    descricao: "Descontos em compras para membros do racha.",
    link: "#",
  },
];

export default function NossosParceiros() {
  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <link rel="canonical" href={seo.url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.url} />
      </Head>

      <main className="w-full pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mb-2 flex items-center justify-center gap-2">
            Nossos Parceiros
            <span
              role="img"
              aria-label="aperto de mãos"
              className="text-yellow-300 text-2xl md:text-3xl"
            >
              🤝
            </span>
          </h1>
          <p className="text-center text-base md:text-lg text-neutral-200 mb-10 max-w-2xl font-medium">
            Ajude quem fortalece o nosso racha! <br />
            Valorize quem acredita na nossa equipe. Siga, prestigie e dê preferência aos nossos
            parceiros, empresas e profissionais que apoiam o racha com descontos, patrocínios,
            produtos e serviços de qualidade.
          </p>

          {/* Cards */}
          <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {parceirosMock.map((p, idx) => (
              <div
                key={p.nome + idx}
                className="flex flex-col items-center bg-neutral-800 rounded-2xl border border-neutral-700 p-5 text-center h-full transition hover:border-yellow-400"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-2">
                  <Image
                    src={p.logo}
                    alt={`Logo de ${p.nome}`}
                    width={64}
                    height={64}
                    className="rounded-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-lg font-bold text-yellow-300 mb-1">{p.nome}</span>
                <span className="text-sm text-neutral-400 mb-2">{p.categoria}</span>
                <p className="text-sm text-neutral-200 mb-2">{p.descricao}</p>
                <Link
                  href={p.link}
                  target="_blank"
                  className={`inline-block mt-auto px-3 py-1 rounded-full text-sm font-semibold ${
                    p.destaque
                      ? "bg-yellow-400 text-neutral-900 hover:bg-yellow-300"
                      : "bg-neutral-900 text-yellow-300 border border-yellow-400 hover:bg-yellow-400 hover:text-neutral-900"
                  } transition`}
                  rel="noopener noreferrer"
                >
                  {p.destaque ? "Site oficial" : "Saiba mais"}
                </Link>
              </div>
            ))}
          </section>

          {/* Texto institucional para novos parceiros */}
          <p className="text-center text-neutral-400 text-sm md:text-base mb-10 max-w-2xl">
            Quer apoiar nosso racha, divulgar sua empresa e fortalecer o futebol 7 entre amigos?
            <br />
            Fale com a administração e saiba como ser um parceiro.
          </p>
        </div>
      </main>
    </>
  );
}

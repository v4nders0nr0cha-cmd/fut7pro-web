"use client";

import Head from "next/head";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";

const paginas = [
  {
    slug: "nossa-historia",
    titulo: "Nossa História",
    descricao:
      "Edite o conteúdo institucional sobre a origem, missão e valores do seu racha. Ideal para contar a trajetória do grupo.",
    rota: "/admin/personalizacao/editar-paginas/nossa-historia",
  },
  {
    slug: "estatuto",
    titulo: "Estatuto",
    descricao:
      "Gerencie as regras oficiais, critérios, direitos e deveres do seu racha de forma simples e segura.",
    rota: "/admin/personalizacao/editar-paginas/estatuto",
  },
  {
    slug: "contatos",
    titulo: "Contatos",
    descricao:
      "Atualize e personalize os canais de contato, WhatsApp, redes sociais e informações públicas do seu racha.",
    rota: "/admin/personalizacao/editar-paginas/contatos",
  },
];

export default function EditarPaginas() {
  return (
    <>
      <Head>
        <title>Páginas do Sobre Nós | Personalização | Painel Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Atualize os textos que aparecem na página Sobre Nós do seu racha (Nossa História, Estatuto e Contatos) no Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, racha, sistema de futebol, personalização, páginas do sobre nós, nossa história, estatuto, contatos, SaaS, admin"
        />
      </Head>
      <div className="min-h-screen bg-[#181A20] pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Páginas do Sobre Nós</h1>
          <p className="text-gray-300 mb-8 text-base max-w-2xl text-balance">
            Atualize os textos que aparecem na página Sobre Nós do seu racha (Nossa História,
            Estatuto e Contatos). As mudanças são exibidas no site público em /[slug]/sobre-nos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginas.map((pagina) => (
              <div
                key={pagina.slug}
                className="bg-[#22232A] rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-all border border-[#232333]"
              >
                <div>
                  <h2 className="text-xl font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    {pagina.titulo}
                  </h2>
                  <p className="text-gray-300 text-sm mb-4">{pagina.descricao}</p>
                </div>
                <div className="flex flex-row justify-end">
                  <Link
                    href={pagina.rota}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-[#181A20] font-semibold hover:bg-yellow-300 transition-all"
                    aria-label={`Editar página ${pagina.titulo}`}
                  >
                    <FaEdit className="text-base" />
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

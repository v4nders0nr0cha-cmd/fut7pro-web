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
        <title>Editar Páginas | Personalização | Painel Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Personalize facilmente as páginas institucionais do seu racha: Nossa História, Estatuto e Contatos. Plataforma SaaS Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, racha, sistema de futebol, personalização, editar páginas, estatuto, história, contatos, SaaS, admin"
        />
      </Head>
      <div className="min-h-screen bg-[#181A20] px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Editar Páginas Institucionais
          </h1>
          <p className="mb-8 text-base text-gray-300">
            Gerencie os textos e informações das principais páginas públicas do
            seu racha.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {paginas.map((pagina) => (
              <div
                key={pagina.slug}
                className="flex flex-col justify-between rounded-2xl border border-[#232333] bg-[#22232A] p-6 shadow-lg transition-all hover:shadow-2xl"
              >
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold text-yellow-400">
                    {pagina.titulo}
                  </h2>
                  <p className="mb-4 text-sm text-gray-300">
                    {pagina.descricao}
                  </p>
                </div>
                <div className="flex flex-row justify-end">
                  <Link
                    href={pagina.rota}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-[#181A20] transition-all hover:bg-yellow-300"
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

"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { atletasMock } from "@/components/lists/mockAtletas";

export default function ListaAtletasPage() {
  const [busca, setBusca] = useState("");

  // Mantendo ordem: mensalistas antes, tudo ordenado alfabeticamente
  const mensalistas = atletasMock
    .filter((a) => a.mensalista)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const naoMensalistas = atletasMock
    .filter((a) => !a.mensalista)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // Filtro universal
  const atletasFiltrados = [...mensalistas, ...naoMensalistas].filter(
    (atleta) => atleta.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <Head>
        <title>Perfis dos Atletas | Estatísticas e Conquistas | Fut7Pro</title>
        <meta
          name="description"
          content="Conheça o perfil completo de todos os atletas do seu racha: estatísticas, conquistas, posição em campo e evolução ao longo das temporadas. Compare jogadores, busque destaques e acompanhe o futebol 7 entre amigos com o sistema Fut7Pro."
        />
        <meta
          name="keywords"
          content="fut7, atletas, jogadores, racha, futebol 7, estatísticas, conquistas, perfil, sistema, SaaS"
        />
      </Head>

      {/* TÍTULO PRINCIPAL PADRÃO */}
      <h1 className="mb-3 mt-10 text-center text-3xl font-extrabold leading-tight text-yellow-400 drop-shadow-sm md:text-4xl">
        Perfis dos Atletas
      </h1>
      {/* DESCRIÇÃO PADRÃO */}
      <p className="mx-auto mb-7 max-w-2xl text-center text-base font-medium leading-relaxed text-gray-300 md:max-w-3xl md:text-lg lg:max-w-4xl xl:max-w-5xl">
        Descubra tudo sobre os <strong>atletas do seu racha</strong>! Acesse o{" "}
        <strong>perfil completo de cada jogador</strong> com estatísticas,
        conquistas, posição em campo, histórico de partidas e evolução por
        temporada. Ideal para comparar desempenho, acompanhar crescimento e
        celebrar os destaques do <strong>futebol 7 entre amigos</strong>!
      </p>
      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Digite o nome do atleta..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="mb-6 w-full rounded bg-zinc-800 p-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
        maxLength={20}
        aria-label="Buscar atleta"
      />

      {/* Cards */}
      <div className="scrollbar-dark w-full overflow-x-auto">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {atletasFiltrados.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-400">
              Nenhum atleta encontrado para o filtro informado.
            </div>
          )}

          {atletasFiltrados.map((atleta) => (
            <Link
              key={atleta.id}
              href={`/atletas/${atleta.slug}`}
              className="rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <div
                className={`relative rounded-xl bg-zinc-900 p-3 text-center text-white shadow-lg transition-all hover:shadow-yellow-400 ${
                  atleta.mensalista ? "border-2 border-green-500" : ""
                }`}
              >
                {/* Label MENSALISTA */}
                {atleta.mensalista && (
                  <span className="absolute left-1 top-1 z-10 text-[10px] font-bold uppercase text-green-400">
                    MENSALISTA
                  </span>
                )}
                <Image
                  src={atleta.foto}
                  alt={`Foto do atleta ${atleta.nome} | Perfil do Jogador Fut7Pro`}
                  width={64}
                  height={64}
                  className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
                <h2 className="truncate text-sm font-semibold text-yellow-300">
                  {atleta.nome}
                </h2>
                <p className="text-xs text-gray-400">{atleta.posicao}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          height: 8px;
          background: #18181b;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 6px;
        }
        .scrollbar-dark {
          scrollbar-color: #333 #18181b;
          scrollbar-width: thin;
        }
      `}</style>
    </>
  );
}

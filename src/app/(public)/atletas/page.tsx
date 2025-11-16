"use client";

import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { usePublicAthletes } from "@/hooks/usePublicAthletes";

export default function ListaAtletasPage() {
  const [busca, setBusca] = useState("");
  const { athletes, isLoading, isError, error } = usePublicAthletes();

  const atletasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const ordenados = [...athletes].sort((a, b) => {
      if (a.isMember && !b.isMember) return -1;
      if (!a.isMember && b.isMember) return 1;
      return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    });

    if (!termo) {
      return ordenados;
    }

    return ordenados.filter((atleta) => {
      const nome = atleta.nome.toLowerCase();
      const apelido = (atleta.nickname ?? "").toLowerCase();
      return nome.includes(termo) || apelido.includes(termo);
    });
  }, [athletes, busca]);

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

      <h1 className="mt-10 mb-3 text-3xl md:text-4xl font-extrabold text-yellow-400 text-center leading-tight drop-shadow-sm">
        Perfis dos Atletas
      </h1>
      <p className="mb-7 text-base md:text-lg text-gray-300 text-center max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed font-medium">
        Descubra tudo sobre os <strong>atletas do seu racha</strong>! Acesse o{" "}
        <strong>perfil completo de cada jogador</strong> com estatísticas, conquistas, posição em
        campo, histórico de partidas e evolução por temporada. Ideal para comparar desempenho,
        acompanhar crescimento e celebrar os destaques do <strong>futebol 7 entre amigos</strong>!
      </p>

      <input
        type="text"
        placeholder="Digite o nome do atleta..."
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        className="w-full p-2 rounded bg-zinc-800 text-white mb-6 outline-none focus:ring-2 focus:ring-yellow-400"
        maxLength={40}
        aria-label="Buscar atleta"
      />

      {isError && (
        <div className="w-full text-center text-red-200 bg-red-900/40 border border-red-700/40 px-4 py-3 rounded-lg mb-6">
          {error ?? "Não foi possível carregar os atletas. Tente novamente em instantes."}
        </div>
      )}

      <div className="w-full overflow-x-auto scrollbar-dark">
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading && atletasFiltrados.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8">
              Carregando atletas...
            </div>
          )}

          {!isLoading && atletasFiltrados.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8">
              Nenhum atleta encontrado para o filtro informado.
            </div>
          )}

          {atletasFiltrados.map((atleta) => (
            <Link
              key={atleta.id}
              href={`/atletas/${atleta.slug}`}
              className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-xl"
            >
              <div
                className={`relative p-3 rounded-xl shadow-lg hover:shadow-yellow-400 transition-all text-center text-white bg-zinc-900 ${
                  atleta.isMember ? "border-2 border-green-500" : ""
                }`}
              >
                {atleta.isMember && (
                  <span className="absolute top-1 left-1 text-green-400 text-[10px] font-bold uppercase z-10">
                    MENSALISTA
                  </span>
                )}
                <Image
                  src={atleta.photoUrl}
                  alt={`Foto do atleta ${atleta.nome} | Perfil do Jogador Fut7Pro`}
                  width={64}
                  height={64}
                  className="rounded-full mx-auto mb-2 object-cover w-16 h-16"
                  loading="lazy"
                  draggable={false}
                />
                <h2 className="text-sm font-semibold text-yellow-300 truncate">{atleta.nome}</h2>
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

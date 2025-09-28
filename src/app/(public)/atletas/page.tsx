"use client";

import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { useAtletas } from "@/hooks/useAtletas";
import { useTenant } from "@/hooks/useTenant";
import { useRacha } from "@/context/RachaContext";

const FOTO_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

export default function ListaAtletasPage() {
  const [busca, setBusca] = useState("");
  const { tenant } = useTenant();
  const { rachaId } = useRacha();

  const tenantSlug = tenant?.slug ?? null;
  const effectiveRachaId = tenant?.id ?? rachaId ?? null;

  const { atletas, isLoading, isError, error } = useAtletas(effectiveRachaId, tenantSlug);

  const atletasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return atletas;
    }

    return atletas.filter((atleta) =>
      [atleta.nome, atleta.apelido ?? ""].some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [atletas, busca]);

  return (
    <>
      <Head>
        <title>Perfis dos Atletas | Estatisticas e Conquistas | Fut7Pro</title>
        <meta
          name="description"
          content="Conheca o perfil completo de cada atleta do racha: estatisticas, conquistas e evolucao."
        />
        <meta
          name="keywords"
          content="fut7, atletas, jogadores, racha, futebol 7, estatisticas, conquistas"
        />
      </Head>

      <h1 className="mt-10 mb-3 text-3xl md:text-4xl font-extrabold text-yellow-400 text-center leading-tight drop-shadow-sm">
        Perfis dos Atletas
      </h1>
      <p className="mb-7 text-base md:text-lg text-gray-300 text-center max-w-3xl mx-auto leading-relaxed font-medium">
        Descubra tudo sobre os atletas do seu racha. Compare desempenho, acompanhe gols e
        assistencias e celebre os destaques do Fut7Pro.
      </p>

      <div className="w-full flex flex-col items-center gap-4">
        <input
          type="text"
          placeholder="Digite o nome do atleta"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          className="w-full max-w-xl p-2 rounded bg-zinc-800 text-white outline-none focus:ring-2 focus:ring-yellow-400"
          maxLength={60}
          aria-label="Buscar atleta"
        />

        {isLoading ? (
          <div className="py-16 text-gray-300">Carregando atletas...</div>
        ) : isError ? (
          <div className="py-10 px-4 bg-red-500/10 border border-red-500/30 rounded text-red-200 text-center max-w-xl">
            {error ?? "Nao foi possivel carregar os atletas agora. Tente novamente em instantes."}
          </div>
        ) : atletasFiltrados.length === 0 ? (
          <div className="py-16 text-gray-400">
            Nenhum atleta encontrado para o filtro informado.
          </div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-dark">
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {atletasFiltrados.map((atleta) => (
                <Link
                  key={atleta.id}
                  href={`/atletas/${atleta.slug}`}
                  className="focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-xl"
                >
                  <div className="relative p-3 rounded-xl shadow-lg hover:shadow-yellow-400 transition-all text-center text-white bg-zinc-900 border border-zinc-800">
                    <Image
                      src={atleta.foto || FOTO_FALLBACK}
                      alt={`Foto do atleta ${atleta.nome}`}
                      width={96}
                      height={96}
                      className="rounded-full mx-auto mb-3 object-cover w-24 h-24 border border-yellow-400/40"
                      loading="lazy"
                    />
                    <h2
                      className="text-base font-semibold text-yellow-300 truncate"
                      title={atleta.nome}
                    >
                      {atleta.nome}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {atleta.posicao?.trim() ? atleta.posicao : "Posicao nao informada"}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <span className="bg-zinc-800/80 rounded px-2 py-1">
                        Jogos: {atleta.stats.jogos}
                      </span>
                      <span className="bg-zinc-800/80 rounded px-2 py-1">
                        Gols: {atleta.stats.gols}
                      </span>
                      <span className="bg-zinc-800/80 rounded px-2 py-1">
                        Assistencias: {atleta.stats.assistencias}
                      </span>
                      <span className="bg-zinc-800/80 rounded px-2 py-1">
                        Vitorias: {atleta.stats.vitorias}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
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

"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useAtletaDetalhe } from "@/hooks/useAtletas";
import { useRacha } from "@/context/RachaContext";
import { useTenant } from "@/hooks/useTenant";

const FOTO_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

const ASSIDUIDADE_LABELS = [
  { limite: 100, label: "Lenda" },
  { limite: 50, label: "Veterano" },
  { limite: 20, label: "Destaque" },
  { limite: 10, label: "Titular" },
  { limite: 3, label: "Juvenil" },
];

const RESULTADO_LABELS: Record<string, string> = {
  V: "Vitoria",
  E: "Empate",
  D: "Derrota",
};

function nivelAssiduidade(jogos: number) {
  const found = ASSIDUIDADE_LABELS.find((item) => jogos >= item.limite);
  return found ? found.label : "Novato";
}

function formatDate(iso: string) {
  if (!iso) {
    return "";
  }
  const [datePart] = iso.split("T");
  const [ano, mes, dia] = datePart.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function PerfilAtletaPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const { tenant } = useTenant();
  const { rachaId } = useRacha();

  const tenantSlug = tenant?.slug ?? null;
  const effectiveRachaId = tenant?.id ?? rachaId ?? null;

  const { atleta, isLoading, isError, error } = useAtletaDetalhe(
    slug,
    effectiveRachaId,
    tenantSlug
  );

  const stats = useMemo(
    () =>
      atleta?.stats ?? {
        jogos: 0,
        gols: 0,
        assistencias: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        mediaPontuacao: 0,
      },
    [atleta]
  );

  const historico = atleta?.historicoRecentes ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
        <span className="mt-3 text-sm">Carregando perfil do atleta...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-200 max-w-lg">
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar atleta</h1>
          <p>{error ?? "Nao foi possivel carregar os dados deste atleta agora."}</p>
        </div>
      </div>
    );
  }

  if (!atleta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-300">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">Atleta nao encontrado</h1>
        <p className="text-sm text-gray-400">
          Verifique se o link esta correto ou selecione outro atleta na lista.
        </p>
        <Link href="/atletas" className="mt-4 text-yellow-300 hover:underline">
          Voltar para a lista de atletas
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Perfil de {atleta.nome} | Fut7Pro</title>
        <meta
          name="description"
          content={`Veja estatisticas, conquistas e historico recente de ${atleta.nome} no Fut7Pro.`}
        />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-10 text-white">
        <h1 className="sr-only">Perfil do atleta {atleta.nome}</h1>

        <section className="flex flex-col md:flex-row gap-8 mb-10 items-center md:items-start">
          <div className="flex-shrink-0">
            <Image
              src={atleta.foto || FOTO_FALLBACK}
              alt={`Foto do atleta ${atleta.nome}`}
              width={160}
              height={160}
              className="rounded-full border-4 border-yellow-400 object-cover"
              priority
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <h2 className="text-4xl font-bold text-yellow-400">{atleta.nome}</h2>
            {atleta.apelido && <p className="text-yellow-300">Apelido: {atleta.apelido}</p>}
            <p>
              Posicao: <span className="font-semibold">{atleta.posicao ?? "Nao informada"}</span>
            </p>
            <p>
              Nivel de assiduidade:{" "}
              <span className="font-semibold">{nivelAssiduidade(stats.jogos)}</span>
            </p>
            <p>
              Media de pontos:{" "}
              <span className="font-semibold">{stats.mediaPontuacao.toFixed(2)}</span>
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-12">
          {[
            { label: "Jogos", valor: stats.jogos },
            { label: "Vitorias", valor: stats.vitorias },
            { label: "Empates", valor: stats.empates },
            { label: "Derrotas", valor: stats.derrotas },
            { label: "Gols", valor: stats.gols },
            { label: "Assistencias", valor: stats.assistencias },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-800 p-4 rounded text-center shadow-md">
              <p className="text-xl font-bold text-yellow-400">{item.valor}</p>
              <p className="text-sm text-zinc-400 mt-1">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3 text-center md:text-left">
            Historico recente
          </h2>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-400">Sem partidas registradas recentemente.</p>
          ) : (
            <ul className="space-y-3">
              {historico.map((item) => (
                <li
                  key={`${item.partidaId}-${item.dataISO}`}
                  className="bg-zinc-900 border border-zinc-800 rounded px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span className="text-sm text-gray-400">{formatDate(item.dataISO)}</span>
                    <span className="text-sm text-white">
                      Resultado: {RESULTADO_LABELS[item.resultado] ?? item.resultado} ({item.placar}
                      )
                    </span>
                    <span className="text-sm text-gray-300">Adversario: {item.adversario}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-300">
                    <span>Gols: {item.gols}</span>
                    <span>Assistencias: {item.assistencias}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="text-center mt-4">
            <Link
              href={`/atletas/${atleta.slug}/historico`}
              className="text-yellow-300 hover:underline text-sm"
            >
              Ver historico completo
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3 text-center md:text-left">
            Conquistas
          </h2>
          {atleta.conquistas.length === 0 ? (
            <p className="text-sm text-gray-400">Sem conquistas registradas ainda.</p>
          ) : (
            <ul className="space-y-2">
              {atleta.conquistas.map((conquista, index) => (
                <li
                  key={`${conquista.titulo}-${index}`}
                  className="bg-zinc-900 border border-zinc-800 rounded px-4 py-3"
                >
                  <p className="text-sm text-white font-semibold">{conquista.titulo}</p>
                  <p className="text-xs text-gray-400">
                    {conquista.ano ?? "Ano indefinido"}
                    {conquista.tipo ? ` | ${conquista.tipo}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="text-center mt-4">
            <Link
              href={`/atletas/${atleta.slug}/conquistas`}
              className="text-yellow-300 hover:underline text-sm"
            >
              Ver todas as conquistas
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

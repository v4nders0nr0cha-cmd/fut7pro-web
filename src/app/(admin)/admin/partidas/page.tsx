"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { FaClipboardList, FaHistory, FaExternalLinkAlt } from "react-icons/fa";
import { useTimesDoDiaPublicado } from "@/hooks/useTimesDoDiaPublicado";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

const APP_PUBLIC_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

function parseDateInput(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("/");
  if (parts.length >= 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2].trim().slice(0, 4));
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) return date;
  return null;
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function PartidasPage() {
  const { data: session } = useSession();
  const { me } = useMe();
  const { tenantSlug } = useRacha();
  const sorteioPublicado = useTimesDoDiaPublicado({ source: "admin" });
  const resolvedSlug = useMemo(() => {
    const sessionSlug = (session?.user as { tenantSlug?: string | null } | undefined)?.tenantSlug;
    return me?.tenant?.tenantSlug || sessionSlug || tenantSlug || rachaConfig.slug;
  }, [me?.tenant?.tenantSlug, session?.user, tenantSlug]);
  const publicBaseUrl = useMemo(() => {
    const slug = resolvedSlug || rachaConfig.slug;
    return `${APP_PUBLIC_URL}/${encodeURIComponent(slug)}`;
  }, [resolvedSlug]);
  const confrontosPublicosUrl = `${publicBaseUrl}/partidas/times-do-dia`;
  const hasConfrontosHoje = useMemo(() => {
    const date = parseDateInput(
      sorteioPublicado.data?.dataPartida || sorteioPublicado.data?.publicadoEm
    );
    if (!date) return false;
    return isSameLocalDay(date, new Date());
  }, [sorteioPublicado.data]);

  return (
    <>
      <Head>
        <title>Partidas e Resultados | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Centralize o seu racha em um so lugar: registre resultados do Sorteio Inteligente e consulte o historico completo de partidas."
        />
        <meta
          name="keywords"
          content="partidas fut7, resultados, historico de jogos, painel admin, fut7pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white px-4 pt-[64px] md:pt-[80px] pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3 text-center">
            Partidas e Resultados
          </h1>
          <p className="text-center text-gray-300 mb-2 max-w-2xl mx-auto">
            Centralize o seu racha em um so lugar: registre os resultados dos confrontos gerados no
            Sorteio Inteligente e consulte o historico completo de partidas, com filtros por periodo
            e busca rapida.
          </p>
          <p className="text-center text-xs text-gray-400 mb-10 max-w-2xl mx-auto">
            As partidas do Sorteio Inteligente ja ficam disponiveis no site publico, aqui voce
            controla o que vira resultado oficial e o que entra nos rankings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl border-2 border-yellow-400 bg-zinc-900/90 p-6 shadow-lg">
              <span className="absolute top-4 right-4 rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-semibold text-black">
                Recomendado
              </span>
              <div className="flex items-start gap-3">
                <FaClipboardList className="text-yellow-400 text-3xl mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-yellow-300">
                    Registrar Resultados do Dia
                  </h2>
                  <p className="text-sm text-gray-300 mt-2">
                    Lance os placares dos confrontos de hoje, finalize as partidas e atualize
                    automaticamente rankings, destaques e desempenho dos atletas.
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-yellow-400">-</span>
                  Lancamento rapido por confronto (placar e destaques)
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">-</span>
                  Validacao para evitar erros (ex: placar incompleto)
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">-</span>
                  Finalizacao oficial para liberar Time Campeao do Dia
                </li>
              </ul>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/admin/partidas/historico?scope=hoje&tab=sem-resultado"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
                >
                  Lancar Resultados de Hoje
                </Link>
                <a
                  href={confrontosPublicosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-sm text-yellow-300 hover:text-yellow-200"
                >
                  Ver confrontos publicados no site publico
                  <FaExternalLinkAlt className="text-yellow-300 text-xs" />
                </a>
              </div>

              {sorteioPublicado.isLoading ? (
                <div className="mt-4 text-xs text-gray-400">Carregando confrontos do dia...</div>
              ) : !hasConfrontosHoje ? (
                <div className="mt-4 text-xs text-yellow-200">
                  Nenhum confronto do dia encontrado, publique o Sorteio Inteligente para liberar o
                  lancamento.
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-yellow-400/40 bg-zinc-900/80 p-6">
              <div className="flex items-start gap-3">
                <FaHistory className="text-yellow-400 text-3xl mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-yellow-300">Historico de Partidas</h2>
                  <p className="text-sm text-gray-300 mt-2">
                    Pesquise partidas anteriores, revise resultados, filtre por ano e acompanhe a
                    evolucao do racha ao longo do tempo.
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-yellow-400">-</span>
                  Filtros por ano, mes e periodo
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">-</span>
                  Busca por time, atleta e local
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">-</span>
                  Edicao e correcao de resultados (com registro de alteracao)
                </li>
              </ul>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/admin/partidas/historico?scope=historico&tab=finalizadas"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
                >
                  Abrir Historico Completo
                </Link>
                <span className="text-xs text-gray-500">Exportar relatorio (em breve)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

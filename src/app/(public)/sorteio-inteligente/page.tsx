"use client";

import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const pilares = [
  {
    title: "Rankings automáticos",
    description:
      "O balanceamento considera desempenho real em partidas: pontos, gols, assistências, assiduidade e histórico.",
  },
  {
    title: "Contexto por posição",
    description:
      "A distribuição respeita função em campo (goleiro, zagueiro, meia e atacante) para reduzir desequilíbrios.",
  },
  {
    title: "Ajuste com estrelas",
    description:
      "A diretoria pode complementar a leitura do sistema com estrelas por atleta para calibrar os primeiros ciclos.",
  },
];

const etapas = [
  "Seleção dos atletas disponíveis para o dia.",
  "Cálculo de coeficientes por desempenho e posição.",
  "Distribuição automática em times equilibrados.",
  "Ajustes finais do administrador antes da publicação.",
];

const regras = [
  "Evita concentrações repetidas de atletas no mesmo time.",
  "Usa histórico recente para reduzir distorções de curto prazo.",
  "Mantém transparência: os resultados publicados ficam visíveis no site do racha.",
];

export default function SorteioInteligentePage() {
  const { hasPermission, isAuthenticated } = useAuth();
  const { publicHref } = usePublicLinks();
  const isAdmin = isAuthenticated && hasPermission("RACHA_UPDATE");

  return (
    <>
      <Head>
        <title>Sorteio Inteligente | Sistema de Balanceamento | Fut7Pro</title>
        <meta
          name="description"
          content="Entenda como funciona o sistema de balanceamento inteligente do Fut7Pro: times equilibrados com base em ranking, posição, histórico e ajustes da administração."
        />
        <meta
          name="keywords"
          content="sorteio inteligente, balanceamento de times, fut7pro, futebol 7, racha, ranking, posições"
        />
      </Head>

      <main className="min-h-screen bg-fundo w-full pt-10 pb-12 px-4">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-brand text-center mb-4">
            Sistema de Balanceamento Inteligente
          </h1>
          <p className="text-center text-gray-300 max-w-3xl mx-auto mb-10">
            O Fut7Pro transforma o antigo sorteio manual em um processo técnico, justo e auditável.
            O objetivo é gerar partidas mais equilibradas e competitivas, com melhor experiência
            para todo o grupo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {pilares.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-white/10 bg-[#181818] p-5 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-brand-soft mb-2">{item.title}</h2>
                <p className="text-sm text-gray-300">{item.description}</p>
              </article>
            ))}
          </div>

          <section className="rounded-xl border border-white/10 bg-[#151515] p-5 mb-6">
            <h2 className="text-xl font-semibold text-brand mb-3">Como funciona na prática</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-200">
              {etapas.map((etapa) => (
                <li key={etapa}>{etapa}</li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#151515] p-5 mb-8">
            <h2 className="text-xl font-semibold text-brand mb-3">
              Regras de equilíbrio aplicadas
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-200">
              {regras.map((regra) => (
                <li key={regra}>{regra}</li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={publicHref("/partidas/times-do-dia")}
              className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-3 font-semibold text-black hover:bg-brand-strong transition"
            >
              Ver Times do Dia Publicados
            </Link>
            {isAdmin ? (
              <Link
                href="/admin/partidas/sorteio-inteligente"
                className="inline-flex items-center justify-center rounded-lg border border-brand px-5 py-3 font-semibold text-brand hover:bg-brand hover:text-black transition"
              >
                Abrir Painel de Sorteio
              </Link>
            ) : (
              <Link
                href={publicHref("/entrar")}
                className="inline-flex items-center justify-center rounded-lg border border-brand px-5 py-3 font-semibold text-brand hover:bg-brand hover:text-black transition"
              >
                Entrar na Conta do Atleta
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

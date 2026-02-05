"use client";

import Head from "next/head";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePublicComunicados } from "@/hooks/usePublicComunicados";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { ComunicadoItem } from "@/types/comunicado";

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const renderCard = (item: ComunicadoItem, variant: "active" | "archived") => {
  const periodLabel = `${formatDate(item.startAt)} - ${formatDate(item.endAt)}`;
  const archivedLabel = item.archivedAt ? formatDate(item.archivedAt) : "--";
  return (
    <li
      key={item.id}
      className={`bg-zinc-800 rounded-lg p-4 text-zinc-100 border-l-4 ${
        variant === "active" ? "border-brand" : "border-zinc-600"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <span className="text-lg font-bold text-brand-soft">{item.title}</span>
        <span className="text-xs text-gray-400">Período: {periodLabel}</span>
      </div>
      <div className="mt-1 text-sm text-gray-200">{item.message}</div>
      <div className="text-xs text-gray-400 mt-2">
        Tipo: <span className="font-semibold">{item.severity}</span>
        {variant === "archived" && <span className="ml-2">Arquivado em: {archivedLabel}</span>}
      </div>
    </li>
  );
};

export default function ComunicadosPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();
  const { active, archivedRecent, isLoading, error } = usePublicComunicados({
    enabled: isAuthenticated,
    days: 30,
  });

  if (authLoading) {
    return (
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-brand mb-2">Comunicados Oficiais</h1>
          <p className="text-gray-300 mb-4">Entre para acessar os comunicados do seu racha.</p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/login"))}
            className="bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Comunicados | Fut7Pro</title>
        <meta
          name="description"
          content="Veja comunicados e avisos oficiais publicados pela administracao do seu racha."
        />
      </Head>
      <main className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <h1 className="text-xl font-bold text-zinc-100 mb-4">Comunicados Oficiais</h1>
        {isLoading ? (
          <div className="text-zinc-400 text-center">Carregando...</div>
        ) : error ? (
          <div className="text-red-400 text-center">
            Falha ao carregar comunicados.
            <div className="text-xs text-red-300 mt-2">{String(error)}</div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-300 mb-2 font-semibold">Ativos agora</div>
              {active.length === 0 ? (
                <div className="text-zinc-400 text-center">Nenhum comunicado ativo.</div>
              ) : (
                <ul className="space-y-4">{active.map((item) => renderCard(item, "active"))}</ul>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-300 mb-2 font-semibold">Arquivados recentes</div>
              {archivedRecent.length === 0 ? (
                <div className="text-zinc-400 text-center">Nenhum comunicado recente.</div>
              ) : (
                <ul className="space-y-4">
                  {archivedRecent.map((item) => renderCard(item, "archived"))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

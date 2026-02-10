"use client";

import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import useSWR from "swr";
import {
  FaHistory,
  FaCheckCircle,
  FaBug,
  FaStar,
  FaMinusCircle,
  FaQuestionCircle,
  FaSyncAlt,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa";

type ChangelogType = "novidade" | "correcao" | "ajuste" | "melhoria" | "removido" | "seguranca";

type ChangelogItem = {
  id: string;
  type: ChangelogType;
  label: string;
  description: string;
};

type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  summary: string;
  releaseDate: string | null;
  items: ChangelogItem[];
};

type ChangelogMeta = {
  total: number;
  latestVersion: string | null;
  latestReleaseDate: string | null;
  categories: Record<ChangelogType, number>;
};

type ChangelogPayload = {
  entries: ChangelogEntry[];
  meta: ChangelogMeta;
};

type FetchError = Error & { status?: number };

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asDateIso(value: unknown): string | null {
  const raw = asString(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function resolveType(raw: unknown): ChangelogType {
  const value = asString(raw).toLowerCase();
  if (value === "novidade") return "novidade";
  if (value === "correcao" || value === "correção") return "correcao";
  if (value === "ajuste") return "ajuste";
  if (value === "melhoria") return "melhoria";
  if (value === "removido") return "removido";
  if (value === "seguranca" || value === "segurança") return "seguranca";
  return "ajuste";
}

function defaultLabelByType(type: ChangelogType) {
  if (type === "novidade") return "Novidade";
  if (type === "correcao") return "Correção";
  if (type === "ajuste") return "Ajuste";
  if (type === "melhoria") return "Melhoria";
  if (type === "removido") return "Removido";
  return "Segurança";
}

function normalizeItem(raw: unknown, index: number): ChangelogItem | null {
  const source = asObject(raw);
  if (!source) return null;
  const description = asString(source.description);
  if (!description) return null;

  const type = resolveType(source.type ?? source.typeRaw);
  const label = asString(source.label) || defaultLabelByType(type);
  const id = asString(source.id) || `item-${index}`;

  return {
    id,
    type,
    label,
    description,
  };
}

function normalizeEntry(raw: unknown, index: number): ChangelogEntry | null {
  const source = asObject(raw);
  if (!source) return null;

  const version = asString(source.version);
  if (!version) return null;

  const itemsRaw = Array.isArray(source.items) ? source.items : [];
  const items = itemsRaw
    .map((item, itemIndex) => normalizeItem(item, itemIndex))
    .filter((item): item is ChangelogItem => Boolean(item));

  const id = asString(source.id) || `entry-${index}`;
  const title = asString(source.title);
  const summary = asString(source.summary);
  const releaseDate = asDateIso(source.releaseDate ?? source.date);

  return {
    id,
    version,
    title,
    summary,
    releaseDate,
    items,
  };
}

function buildDefaultMeta(): ChangelogMeta {
  return {
    total: 0,
    latestVersion: null,
    latestReleaseDate: null,
    categories: {
      novidade: 0,
      correcao: 0,
      ajuste: 0,
      melhoria: 0,
      removido: 0,
      seguranca: 0,
    },
  };
}

function normalizePayload(payload: unknown): ChangelogPayload {
  const root = asObject(payload);
  const dataRaw = Array.isArray(root?.data) ? root.data : [];
  const entries = dataRaw
    .map((entry, index) => normalizeEntry(entry, index))
    .filter((entry): entry is ChangelogEntry => Boolean(entry));

  const metaRaw = asObject(root?.meta ?? null);
  const fallbackMeta = buildDefaultMeta();
  const categoriesRaw = asObject(metaRaw?.categories ?? null);

  const categories: Record<ChangelogType, number> = {
    novidade: Number(categoriesRaw?.novidade ?? fallbackMeta.categories.novidade) || 0,
    correcao: Number(categoriesRaw?.correcao ?? fallbackMeta.categories.correcao) || 0,
    ajuste: Number(categoriesRaw?.ajuste ?? fallbackMeta.categories.ajuste) || 0,
    melhoria: Number(categoriesRaw?.melhoria ?? fallbackMeta.categories.melhoria) || 0,
    removido: Number(categoriesRaw?.removido ?? fallbackMeta.categories.removido) || 0,
    seguranca: Number(categoriesRaw?.seguranca ?? fallbackMeta.categories.seguranca) || 0,
  };

  return {
    entries,
    meta: {
      total: Number(metaRaw?.total ?? entries.length) || entries.length,
      latestVersion: asString(metaRaw?.latestVersion) || entries[0]?.version || null,
      latestReleaseDate: asDateIso(metaRaw?.latestReleaseDate) || entries[0]?.releaseDate || null,
      categories,
    },
  };
}

async function fetcher(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      (body as Record<string, unknown> | null)?.message?.toString() ||
        (body as Record<string, unknown> | null)?.error?.toString() ||
        "Não foi possível carregar as atualizações do sistema."
    ) as FetchError;
    error.status = response.status;
    throw error;
  }

  return body;
}

function getErrorText(error: FetchError | undefined): string {
  if (!error) return "";
  if (error.status === 401) return "Sua sessão expirou. Faça login novamente para continuar.";
  if (error.status === 403) return "Você não possui permissão para consultar as atualizações.";
  return error.message || "Falha ao carregar a central de atualizações.";
}

function formatDatePtBr(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("pt-BR");
}

function badge(type: ChangelogType) {
  if (type === "novidade") {
    return (
      <span className="bg-green-700 text-green-100 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-semibold">
        <FaStar /> Novidade
      </span>
    );
  }
  if (type === "correcao") {
    return (
      <span className="bg-blue-700 text-blue-100 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-semibold">
        <FaBug /> Correção
      </span>
    );
  }
  if (type === "ajuste") {
    return (
      <span className="bg-yellow-700 text-yellow-100 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-semibold">
        <FaCheckCircle /> Ajuste
      </span>
    );
  }
  if (type === "melhoria") {
    return (
      <span className="bg-cyan-700 text-cyan-100 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-semibold">
        <FaTools /> Melhoria
      </span>
    );
  }
  if (type === "removido") {
    return (
      <span className="bg-red-700 text-red-100 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-semibold">
        <FaMinusCircle /> Removido
      </span>
    );
  }
  return (
    <span className="bg-purple-700 text-purple-100 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-semibold">
      <FaShieldAlt /> Segurança
    </span>
  );
}

export default function ChangelogPage() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<unknown, FetchError>(
    "/api/admin/changelog?limit=30",
    fetcher,
    { revalidateOnFocus: false }
  );

  const normalized = useMemo(() => normalizePayload(data), [data]);
  const entries = normalized.entries;
  const meta = normalized.meta;
  const errorText = getErrorText(error);

  return (
    <>
      <Head>
        <title>Central de Atualizações | Fut7Pro Admin</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta
          name="description"
          content="Acompanhe novidades, correções e melhorias aplicadas no Fut7Pro com total transparência para o seu racha."
        />
        <meta
          name="keywords"
          content="Fut7Pro, central de atualizações, changelog, novidades, correções, melhorias"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaHistory /> Central de Atualizações
        </h1>

        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow text-sm">
          <b className="text-yellow-300">Transparência total sobre a evolução do Fut7Pro.</b>
          <br />
          Aqui você acompanha novidades, correções e melhorias que já foram aplicadas no sistema.
          <span className="text-gray-300 block mt-1">
            Sempre que houver uma nova entrega em produção, o registro aparece nesta central.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Última versão publicada
            </div>
            <div className="text-lg text-yellow-300 font-semibold">{meta.latestVersion || "-"}</div>
          </div>
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Última atualização
            </div>
            <div className="text-lg text-gray-100 font-semibold">
              {formatDatePtBr(meta.latestReleaseDate)}
            </div>
          </div>
          <div className="bg-[#232323] rounded-lg p-4 border border-yellow-700 shadow">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Releases disponíveis
            </div>
            <div className="text-lg text-green-300 font-semibold">{meta.total}</div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-end">
          <button
            type="button"
            onClick={() => mutate()}
            disabled={isValidating}
            className="bg-[#1d1d1d] hover:bg-[#2a2a2a] text-yellow-300 font-bold px-4 py-2 rounded transition border border-yellow-700 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <FaSyncAlt className={isValidating ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {isLoading && (
          <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 text-gray-300 text-sm mb-8">
            Carregando atualizações...
          </div>
        )}

        {!isLoading && errorText && (
          <div className="bg-red-950/40 rounded-lg p-4 shadow border border-red-700 text-red-200 text-sm mb-8">
            {errorText}
          </div>
        )}

        {!isLoading && !errorText && entries.length === 0 && (
          <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 text-gray-300 text-sm mb-8">
            Ainda não há atualizações publicadas.
          </div>
        )}

        {!isLoading && !errorText && entries.length > 0 && (
          <div className="space-y-6 mb-8">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                  <div>
                    <h2 className="font-bold text-yellow-300 text-xl">Versão {entry.version}</h2>
                    {entry.title && <p className="text-sm text-gray-300 mt-1">{entry.title}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{formatDatePtBr(entry.releaseDate)}</span>
                </div>

                {entry.summary && <p className="text-sm text-gray-200 mb-3">{entry.summary}</p>}

                <ul className="space-y-2">
                  {entry.items.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center gap-2">
                      {badge(item.type)}
                      <span className="text-gray-200 text-sm">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}

        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-1">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Como sou avisado sobre novidades?</b> Além desta central, novas entregas podem
              aparecer em notificações no painel.
            </li>
            <li>
              <b>Esse histórico mostra ações dos administradores?</b> Não. Para auditoria de ações
              do seu racha, acesse{" "}
              <Link href="/admin/administracao/logs" className="underline text-yellow-400">
                Administração &gt; Logs/Admin
              </Link>
              .
            </li>
            <li>
              <b>Precisa de ajuda?</b>{" "}
              <Link href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                Abrir chamado
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

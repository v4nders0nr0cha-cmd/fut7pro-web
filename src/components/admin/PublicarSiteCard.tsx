"use client";

import * as React from "react";

type ChecklistItem = { key: string; label: string; ok: boolean };

type Props = {
  rachaId: string;
  slug: string;
  ativo: boolean;
};

export default function PublicarSiteCard({ rachaId, slug, ativo }: Props) {
  const [items, setItems] = React.useState<ChecklistItem[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [published, setPublished] = React.useState(ativo);

  React.useEffect(() => {
    fetch(`/api/admin/racha/checklist?rachaId=${rachaId}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, [rachaId]);

  const allOk = items?.every((i) => i.ok) ?? false;

  async function publish() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/racha/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rachaId }),
      });
      if (r.ok) setPublished(true);
    } finally {
      setLoading(false);
    }
  }

  async function unpublish() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/racha/unpublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rachaId }),
      });
      if (r.ok) setPublished(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-yellow-600/40 bg-[#161616] p-4 md:p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-yellow-300">Publicação do site</h3>
        {published ? (
          <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs font-semibold text-green-300">
            Publicado
          </span>
        ) : (
          <span className="rounded-full bg-yellow-600/20 px-3 py-1 text-xs font-semibold text-yellow-300">
            Rascunho
          </span>
        )}
      </div>

      {!published && (
        <>
          <ul className="mt-3 space-y-1 text-sm">
            {items?.map((i) => (
              <li key={i.key} className="flex items-center gap-2">
                <span aria-hidden>{i.ok ? "✅" : "⬜️"}</span>
                <span className={i.ok ? "text-gray-300" : "text-gray-400"}>{i.label}</span>
              </li>
            )) || <li className="text-gray-400">Carregando checklist…</li>}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/${slug}?dev=1`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-yellow-700 px-3 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-600/10"
            >
              Pré-visualizar
            </a>
            <button
              disabled={!allOk || loading}
              onClick={publish}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                allOk && !loading
                  ? "bg-yellow-500 text-black hover:bg-yellow-400"
                  : "bg-yellow-500/40 text-black/60 cursor-not-allowed"
              }`}
            >
              {loading ? "Publicando…" : "Publicar site"}
            </button>
          </div>
        </>
      )}

      {published && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
          >
            Ver o site
          </a>
          <button
            onClick={unpublish}
            disabled={loading}
            className="rounded-lg border border-red-600/70 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-600/10"
          >
            {loading ? "Processando…" : "Despublicar"}
          </button>
        </div>
      )}
    </div>
  );
}

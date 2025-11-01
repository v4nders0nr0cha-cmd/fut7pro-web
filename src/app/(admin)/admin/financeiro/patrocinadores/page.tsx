"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import ToggleVisibilidadePublica from "./components/ToggleVisibilidadePublica";
import { useAuth } from "@/hooks/useAuth";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import type { Patrocinador } from "@/types/patrocinador";
import { useNotification } from "@/context/NotificationContext";
import { FaDownload, FaSpinner } from "react-icons/fa";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

export default function PaginaPatrocinadores() {
  const { user } = useAuth();
  const tenantSlug = user?.tenantSlug ?? null;
  const { notify } = useNotification();
  const {
    patrocinadores,
    isLoading,
    error,
    createPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    toggleFooterForAll,
    toggleFooterVisibility,
  } = usePatrocinadores(tenantSlug);

  const inicioPadrao = useMemo(
    () => new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString().slice(0, 10),
    []
  );
  const [periodo] = useState({ inicio: inicioPadrao, fim: DATA_ATUAL });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Patrocinador | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const footerVisivel = patrocinadores.some((p) => p.showOnFooter);
  const atingiuLimite = patrocinadores.length >= 10;
  const [formatoExport, setFormatoExport] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [filtroTier, setFiltroTier] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [somenteFooter, setSomenteFooter] = useState(false);
  const [exportando, setExportando] = useState(false);
  const patrocinadoresFiltrados = useMemo(() => {
    return patrocinadores.filter((p) => {
      if (filtroTier && p.tier !== filtroTier) {
        return false;
      }
      const statusAtual = p.status ?? "ativo";
      if (filtroStatus && statusAtual !== filtroStatus) {
        return false;
      }
      if (somenteFooter && !p.showOnFooter) {
        return false;
      }
      return true;
    });
  }, [patrocinadores, filtroTier, filtroStatus, somenteFooter]);

  const handleNovo = () => {
    if (atingiuLimite || !tenantSlug) return;
    setSelectedSponsor(null);
    setModalOpen(true);
  };

  const handleEditar = (patro: Patrocinador) => {
    setSelectedSponsor(patro);
    setModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    await deletePatrocinador(id);
  };

  const handleToggleVisibilidade = async () => {
    await toggleFooterForAll(!footerVisivel);
  };

  const handleToggleSponsorFooter = async (id: string, show: boolean) => {
    await toggleFooterVisibility(id, show);
  };

  const handleSave = async (payload: Parameters<typeof createPatrocinador>[0], id?: string) => {
    setSubmitting(true);
    try {
      if (id) {
        await updatePatrocinador(id, payload);
      } else {
        await createPatrocinador(payload);
      }
      setModalOpen(false);
      setSelectedSponsor(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!tenantSlug) {
      notify({ message: "Selecione um racha antes de exportar patrocinadores.", type: "warning" });
      return;
    }

    const params = new URLSearchParams();
    params.set("format", formatoExport);
    params.set("slug", tenantSlug);
    if (filtroTier) {
      params.set("tier", filtroTier);
    }
    if (filtroStatus) {
      params.set("status", filtroStatus);
    }
    if (somenteFooter) {
      params.set("showOnFooter", "true");
    }

    setExportando(true);
    try {
      const response = await fetch(`/api/admin/patrocinadores/export?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ?? errorData.message ?? "Falha ao exportar patrocinadores."
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition =
        response.headers.get("Content-Disposition") ?? response.headers.get("content-disposition");
      link.href = url;
      link.download =
        extractFilename(disposition) ?? `patrocinadores-${Date.now()}.${formatoExport}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify({ message: "Exportação de patrocinadores iniciada com sucesso!", type: "success" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível exportar os patrocinadores.";
      notify({ message, type: "error" });
    } finally {
      setExportando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Painel Admin | Patrocinadores - Fut7Pro</title>
        <meta
          name="description"
          content="Gestão de patrocinadores do racha com integração automática ao site público. Controle vigência, tier, link, benefícios e visibilidade."
        />
        <meta
          name="keywords"
          content="Fut7Pro, painel admin, patrocinadores, racha, futebol, SaaS, financeiro, patrocínio"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center flex-wrap mb-6 gap-2 justify-between">
          <h1 className="text-2xl md:text-3xl font-black text-yellow-400">Patrocinadores</h1>
          <button
            type="button"
            onClick={handleNovo}
            disabled={atingiuLimite || submitting || isLoading || !tenantSlug}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Novo Patrocinador
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filtroTier}
              onChange={(e) => setFiltroTier(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              <option value="">Todos os tiers</option>
              <option value="BASIC">Basic</option>
              <option value="PLUS">Plus</option>
              <option value="PRO">Pro</option>
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="em_breve">Em breve</option>
              <option value="expirado">Expirados</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300 bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-yellow-400"
                checked={somenteFooter}
                onChange={(e) => setSomenteFooter(e.target.checked)}
              />
              Somente rodapé
            </label>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={formatoExport}
              onChange={(e) => setFormatoExport(e.target.value as typeof formatoExport)}
              className="bg-neutral-900 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg"
            >
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportando || !tenantSlug}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {exportando ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FaDownload />
                  Exportar {formatoExport.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>

        {!tenantSlug && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-500 bg-yellow-900/30 text-sm text-yellow-200">
            Selecione um racha válido para gerenciar seus patrocinadores.
          </div>
        )}

        {error && tenantSlug && (
          <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-900/40 text-sm text-red-200">
            Falha ao carregar patrocinadores. Tente novamente mais tarde.
          </div>
        )}

        <CardResumoPatrocinio patrocinadores={patrocinadores} periodo={periodo} />

        <ToggleVisibilidadePublica visivel={footerVisivel} onToggle={handleToggleVisibilidade} />

        {isLoading && (
          <div className="w-full py-8 text-center text-gray-300 text-sm">
            Carregando patrocinadores...
          </div>
        )}

        {!isLoading && (
          <TabelaPatrocinadores
            patrocinadores={patrocinadoresFiltrados}
            onEditar={handleEditar}
            onExcluir={handleExcluir}
            onToggleFooter={handleToggleSponsorFooter}
            onNovo={handleNovo}
          />
        )}

        <ModalPatrocinador
          open={modalOpen}
          onClose={() => {
            if (submitting) return;
            setModalOpen(false);
            setSelectedSponsor(null);
          }}
          onSave={handleSave}
          initial={selectedSponsor}
          submitting={submitting}
        />
      </div>
    </>
  );
}

function extractFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (!filenameMatch) return null;
  try {
    const raw = filenameMatch[1];
    if (raw.startsWith("UTF-8''")) {
      return decodeURIComponent(raw.slice(7));
    }
    return decodeURIComponent(raw.replace(/"/g, ""));
  } catch {
    return null;
  }
}

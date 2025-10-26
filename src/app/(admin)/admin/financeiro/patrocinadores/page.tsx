"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import type { Patrocinador as PatroFin } from "@/types/financeiro";
import type { Patrocinador as PatroRecord } from "@/types/patrocinador";
import CardResumoPatrocinio from "./components/CardResumoPatrocinio";
import TabelaPatrocinadores from "./components/TabelaPatrocinadores";
import ModalPatrocinador from "./components/ModalPatrocinador";
import { usePatrocinadores } from "@/hooks/usePatrocinadores";
import { useTenant } from "@/hooks/useTenant";
import { sponsorsApi } from "@/lib/api";
import { rachaConfig } from "@/config/racha.config";

const DATA_ATUAL = new Date().toISOString().slice(0, 10);

type ModalState = Partial<PatroFin> & {
  ramo?: string;
  sobre?: string;
  cupom?: string;
  beneficio?: string;
  displayOrder?: number;
  tier?: "basic" | "plus" | "pro";
  showOnFooter?: boolean;
};

function formatDateForInput(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function computeStatus(record: PatroRecord): PatroFin["status"] {
  const periodEnd = record.periodoFim ? new Date(record.periodoFim) : null;
  const isExpired = periodEnd ? !Number.isNaN(periodEnd.getTime()) && periodEnd.getTime() < Date.now() : false;
  if (isExpired) return "encerrado";
  const visible = record.showOnFooter ?? record.status !== "inativo";
  return visible ? "ativo" : "inativo";
}

export default function PaginaPatrocinadores() {
  const { tenant, loading: tenantLoading } = useTenant();
  const slug = tenant?.slug || rachaConfig.slug;
  const {
    patrocinadores: patrocinadoresDb,
    addPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    mutate,
  } = usePatrocinadores(slug);

  const [modalOpen, setModalOpen] = useState(false);
  const [editPatrocinador, setEditPatrocinador] = useState<ModalState | undefined>(undefined);
  const [expCounts, setExpCounts] = useState({ expiring: 0, expired: 0 });
  const [scanning, setScanning] = useState(false);

  const inicioPadrao = useMemo(
    () => new Date(new Date().setMonth(new Date().getMonth() - 11)).toISOString().slice(0, 10),
    []
  );
  const periodoPadrao = useMemo(
    () => ({ inicio: inicioPadrao, fim: DATA_ATUAL }),
    [inicioPadrao]
  );

  useEffect(() => {
    let active = true;
    async function loadCounts() {
      try {
        const response = await sponsorsApi.expiring(30);
        if (!active) return;
        const counts = (response.data as any)?.counts;
        if (counts) {
          setExpCounts({
            expiring: counts.expiring ?? 0,
            expired: counts.expired ?? 0,
          });
        } else {
          setExpCounts({ expiring: 0, expired: 0 });
        }
      } catch {
        if (active) setExpCounts({ expiring: 0, expired: 0 });
      }
    }
    loadCounts();
    return () => {
      active = false;
    };
  }, [slug]);

  const patrocinadores: PatroFin[] = useMemo(() => {
    return (patrocinadoresDb ?? []).map((p) => {
      const status = computeStatus(p);
      const visivel = p.showOnFooter ?? status !== "inativo";
      return {
        id: p.id,
        nome: p.nome,
        valor: p.valor ?? 0,
        periodoInicio: formatDateForInput(p.periodoInicio) || inicioPadrao,
        periodoFim: formatDateForInput(p.periodoFim) || DATA_ATUAL,
        descricao: p.descricao ?? p.sobre ?? undefined,
        logo: p.logo,
        status,
        comprovantes: [],
        observacoes: p.beneficio ?? undefined,
        link: p.link || "",
        visivel,
      };
    });
  }, [patrocinadoresDb, inicioPadrao]);

  const handleEditar = (p: PatroFin) => {
    const original = patrocinadoresDb?.find((item) => item.id === p.id);
    const initial: ModalState = {
      ...p,
      valor: original?.valor ?? p.valor,
      periodoInicio: formatDateForInput(original?.periodoInicio ?? p.periodoInicio),
      periodoFim: formatDateForInput(original?.periodoFim ?? p.periodoFim),
      descricao: original?.descricao ?? original?.sobre ?? p.descricao,
      ramo: original?.ramo,
      sobre: original?.sobre,
      cupom: original?.cupom,
      beneficio: original?.beneficio,
      displayOrder: original?.displayOrder ?? original?.prioridade,
      tier: original?.tier ?? "basic",
      showOnFooter: original?.showOnFooter,
      link: original?.link ?? p.link,
    };
    setEditPatrocinador(initial);
    setModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    if (id && id.startsWith("default-")) {
      await mutate();
      return;
    }
    await deletePatrocinador(id);
    try {
      await fetch("/api/revalidate/sponsors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      // revalidate best-effort
    }
  };

  const handleSalvar = async (form: ModalState) => {
    const nome = form.nome?.trim();
    const logo = form.logo?.trim();
    if (!nome || !logo) return;

    const original = form.id ? patrocinadoresDb?.find((item) => item.id === form.id) : undefined;

    const base: Partial<PatroRecord> = {
      id: form.id,
      nome,
      logo,
      link: form.link?.trim() || original?.link || undefined,
      descricao: form.descricao ?? form.observacoes ?? original?.descricao ?? original?.sobre,
      sobre: form.sobre ?? original?.sobre ?? undefined,
      ramo: form.ramo ?? original?.ramo ?? undefined,
      cupom: form.cupom ?? original?.cupom ?? undefined,
      beneficio: form.beneficio ?? original?.beneficio ?? undefined,
      valor: form.valor ?? original?.valor ?? undefined,
      periodoInicio: form.periodoInicio ?? original?.periodoInicio ?? undefined,
      periodoFim: form.periodoFim ?? original?.periodoFim ?? undefined,
      displayOrder: form.displayOrder ?? original?.displayOrder ?? original?.prioridade ?? 1,
      tier: form.tier ?? original?.tier ?? "basic",
    };

    const visibleState =
      form.showOnFooter !== undefined
        ? form.showOnFooter
        : form.visivel ?? original?.showOnFooter ?? true;
    base.showOnFooter = visibleState;
    base.status = (visibleState ? "ativo" : "inativo") as PatroRecord["status"];

    if (form.id && !String(form.id).startsWith("default-")) {
      await updatePatrocinador(base);
    } else {
      const { id, ...createPayload } = base;
      await addPatrocinador(createPayload);
    }

    setModalOpen(false);
    setEditPatrocinador(undefined);
    try {
      await fetch("/api/revalidate/sponsors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      // revalidate best-effort
    }
  };

  const handleToggleVisivel = async (id: string) => {
    const original = patrocinadoresDb?.find((item) => item.id === id);
    const currentVisible =
      original?.showOnFooter ?? (original?.status ?? "ativo") !== "inativo";
    await updatePatrocinador({
      id,
      showOnFooter: !currentVisible,
      status: (!currentVisible ? "ativo" : "inativo") as PatroRecord["status"],
    });
    await mutate();
    try {
      await fetch("/api/revalidate/sponsors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      // revalidate best-effort
    }
  };

  const handleNovo = () => {
    if (patrocinadores.length >= 10) return;
    setEditPatrocinador(undefined);
    setModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>Painel Admin | Patrocinadores - Fut7Pro</title>
        <meta
          name="description"
          content="Gestao de patrocinadores do racha, valores, vigencia, status e integracao automatica com a prestacao de contas."
        />
        <meta
          name="keywords"
          content="Fut7Pro, painel admin, patrocinadores, racha, futebol, SaaS, financeiro, patrocinio"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center flex-wrap mb-6 gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-yellow-400">
            Patrocinadores
          </h1>
          {tenantLoading && <span className="text-sm text-gray-400">Carregando tenant...</span>}
        </div>
        <CardResumoPatrocinio patrocinadores={patrocinadores} periodo={periodoPadrao} />
        <div className="bg-[#23272F] rounded-xl shadow p-4 mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-200">
            <b>{expCounts.expiring}</b> a expirar nos proximos 30 dias &nbsp;
            <b>{expCounts.expired}</b> expirados
          </div>
          <button
            className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-3 py-1 rounded disabled:opacity-60"
            disabled={scanning}
            onClick={async () => {
              try {
                setScanning(true);
                await sponsorsApi.scanAlerts(30);
                const response = await sponsorsApi.expiring(30);
                const counts = (response.data as any)?.counts;
                setExpCounts({
                  expiring: counts?.expiring ?? 0,
                  expired: counts?.expired ?? 0,
                });
              } finally {
                setScanning(false);
              }
            }}
          >
            {scanning ? "Gerando alertas..." : "Gerar alertas"}
          </button>
        </div>
        <TabelaPatrocinadores
          patrocinadores={patrocinadores}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onToggleVisivel={handleToggleVisivel}
          onNovo={handleNovo}
        />
        <ModalPatrocinador
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditPatrocinador(undefined);
          }}
          onSave={handleSalvar}
          initial={editPatrocinador}
        />
      </div>
    </>
  );
}

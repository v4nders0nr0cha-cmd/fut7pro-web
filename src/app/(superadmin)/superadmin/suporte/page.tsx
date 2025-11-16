"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import HeaderSuporte from "@/components/superadmin/HeaderSuporte";
import TicketTable from "@/components/superadmin/TicketTable";
import CardOnboardingPendentes from "@/components/superadmin/CardOnboardingPendentes";
import FaqQuickLinks from "@/components/superadmin/FaqQuickLinks";
import { useContactMessages } from "@/hooks/useContactMessages";
import type { MensagemContato } from "@/types/mensagem";

const SEO = {
  title: "Central de Suporte e Onboarding | Fut7Pro SuperAdmin",
  description:
    "Gerencie tickets, onboarding e suporte SaaS dos rachas Fut7Pro. Painel completo de helpdesk, FAQ e acompanhamento do onboarding dos clientes.",
  keywords:
    "suporte, helpdesk, onboarding, fut7, plataforma futebol, SaaS, tickets, racha, administração",
};

type StatusFiltro = "all" | "novo" | "lido" | "respondido";

type ResumoRacha = {
  slug: string;
  total: number;
  respondido: number;
};

type OnboardingResumo = {
  racha: string;
  percent: number;
  status: "completo" | "parcial" | "incompleto";
  etapasConcluidas: number;
  etapasTotais: number;
};

function criarResumoPorRacha(mensagens: MensagemContato[]): Map<string, ResumoRacha> {
  const mapa = new Map<string, ResumoRacha>();
  mensagens.forEach((mensagem) => {
    const slug = mensagem.slug || "sem-slug";
    const resumo = mapa.get(slug) ?? { slug, total: 0, respondido: 0 };
    resumo.total += 1;
    if (mensagem.status === "respondido") {
      resumo.respondido += 1;
    }
    mapa.set(slug, resumo);
  });
  return mapa;
}

export default function SuporteSuperAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFiltro>("all");
  const { mensagens, isLoading, isError, error } = useContactMessages();

  const resumoPorRacha = useMemo(() => criarResumoPorRacha(mensagens), [mensagens]);

  const onboardingPendentes = useMemo<OnboardingResumo[]>(() => {
    return Array.from(resumoPorRacha.values()).map((resumo) => {
      const percent = resumo.total === 0 ? 0 : Math.round((resumo.respondido / resumo.total) * 100);
      return {
        racha: resumo.slug,
        percent,
        status:
          resumo.respondido >= resumo.total
            ? "completo"
            : resumo.respondido > 0
              ? "parcial"
              : "incompleto",
        etapasConcluidas: resumo.respondido,
        etapasTotais: resumo.total,
      };
    });
  }, [resumoPorRacha]);

  const filteredTickets = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return mensagens
      .filter((mensagem) => {
        const atendeBusca =
          termo.length === 0 ||
          mensagem.assunto.toLowerCase().includes(termo) ||
          mensagem.slug?.toLowerCase().includes(termo) ||
          mensagem.nome.toLowerCase().includes(termo);
        const atendeStatus = statusFilter === "all" || mensagem.status === statusFilter;
        return atendeBusca && atendeStatus;
      })
      .map((mensagem) => {
        const resumo = resumoPorRacha.get(mensagem.slug ?? "") ?? {
          slug: mensagem.slug ?? "sem-slug",
          total: 0,
          respondido: 0,
        };
        const percent =
          resumo.total === 0 ? 0 : Math.round((resumo.respondido / resumo.total) * 100);
        return {
          id: mensagem.id,
          assunto: mensagem.assunto,
          racha: mensagem.slug || "sem-slug",
          status: mensagem.status as "novo" | "lido" | "respondido",
          onboardingPercent: percent,
          dataEnvio: mensagem.dataEnvio,
          contato: mensagem.email,
        };
      });
  }, [mensagens, resumoPorRacha, search, statusFilter]);

  const headerStats = useMemo(() => {
    const novos = mensagens.filter((m) => m.status === "novo").length;
    const lidos = mensagens.filter((m) => m.status === "lido").length;
    const respondidos = mensagens.filter((m) => m.status === "respondido").length;
    return [
      { label: "Novos", value: novos },
      { label: "Lidos", value: lidos },
      { label: "Respondidos", value: respondidos },
      { label: "Rachas ativos", value: resumoPorRacha.size },
    ];
  }, [mensagens, resumoPorRacha]);

  return (
    <>
      <Head>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.keywords} />
      </Head>

      <section className="w-full min-h-screen bg-dark pt-6 px-2 md:px-8 pb-8">
        <HeaderSuporte
          title="Central de Suporte & Onboarding"
          description="Gerencie todos os tickets, onboarding e suporte dos clientes Fut7Pro em um só lugar."
          stats={headerStats}
        />

        <div className="flex flex-col md:flex-row items-center gap-3 my-4">
          <input
            className="w-full md:w-64 px-4 py-2 rounded-xl bg-zinc-900 text-zinc-200 placeholder:text-zinc-400"
            placeholder="Buscar por assunto, racha ou solicitante"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar ticket"
          />
          <select
            className="w-full md:w-48 px-4 py-2 rounded-xl bg-zinc-900 text-zinc-200"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFiltro)}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos</option>
            <option value="novo">Novos</option>
            <option value="lido">Em andamento</option>
            <option value="respondido">Respondidos</option>
          </select>
          <button className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-500 transition">
            Novo Ticket Manual
          </button>
        </div>

        <CardOnboardingPendentes onboardings={onboardingPendentes} />

        {isError && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 text-sm rounded-xl px-4 py-3 mb-4">
            {error ?? "Não foi possível carregar as mensagens de suporte."}
          </div>
        )}

        <TicketTable tickets={filteredTickets} isLoading={isLoading} error={error} />
        <FaqQuickLinks />
      </section>
    </>
  );
}

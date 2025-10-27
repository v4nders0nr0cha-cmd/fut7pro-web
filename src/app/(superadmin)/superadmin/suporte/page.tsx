"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import HeaderSuporte from "@/components/superadmin/HeaderSuporte";
import TicketTable from "@/components/superadmin/TicketTable";
import CardOnboardingPendentes from "@/components/superadmin/CardOnboardingPendentes";
import FaqQuickLinks from "@/components/superadmin/FaqQuickLinks";
import { useSuperadminTickets } from "@/hooks/useSuperadminTickets";

const SEO = {
  title: "Central de Suporte e Onboarding | Fut7Pro SuperAdmin",
  description:
    "Gerencie tickets, onboarding e suporte SaaS dos rachas Fut7Pro. Painel completo de helpdesk, FAQ e acompanhamento do onboarding dos clientes.",
  keywords:
    "suporte, helpdesk, onboarding, fut7, plataforma futebol, SaaS, tickets, racha, administracao",
};

export default function SuporteSuperAdminPage() {
  const { snapshot, tickets, isLoading, error, refresh } = useSuperadminTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchQuery =
        query.length === 0 ||
        ticket.assunto.toLowerCase().includes(query) ||
        (ticket.racha ?? "").toLowerCase().includes(query);

      if (statusFilter === "all") return matchQuery;
      return matchQuery && ticket.status.toLowerCase() === statusFilter;
    });
  }, [tickets, search, statusFilter]);

  const stats = [
    { label: "Abertos", value: snapshot.abertos },
    { label: "Em andamento", value: snapshot.emAndamento },
    { label: "Resolvidos", value: snapshot.resolvidos },
    { label: "Total", value: snapshot.total },
  ];

  return (
    <>
      <Head>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.keywords} />
      </Head>

      <section className="w-full min-h-screen bg-dark pt-6 px-2 md:px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <HeaderSuporte
            title="Central de suporte & onboarding"
            description="Visão consolidada de tickets abertos, andamento e resolvidos nos rachas cadastrados."
            stats={stats}
          />
          <button
            className="self-start md:self-center bg-zinc-800 text-zinc-100 px-4 py-2 rounded-xl font-semibold hover:bg-zinc-700 transition"
            onClick={() => refresh()}
            disabled={isLoading}
          >
            Atualizar
          </button>
        </div>
        {error ? <p className="text-sm text-red-400 mb-4">Erro ao carregar tickets.</p> : null}

        <div className="flex flex-col md:flex-row items-center gap-3 my-4">
          <input
            className="w-full md:w-64 px-4 py-2 rounded-xl bg-zinc-900 text-zinc-200 placeholder:text-zinc-400"
            placeholder="Buscar por assunto ou racha"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar ticket"
          />
          <select
            className="w-full md:w-48 px-4 py-2 rounded-xl bg-zinc-900 text-zinc-200"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos</option>
            <option value="aberto">Abertos</option>
            <option value="andamento">Em andamento</option>
            <option value="em_andamento">Em andamento</option>
            <option value="pendente">Aguardando resposta</option>
            <option value="resolvido">Resolvidos</option>
            <option value="fechado">Fechados</option>
          </select>
          <button className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-500 transition">
            Novo ticket manual
          </button>
        </div>

        <CardOnboardingPendentes onboardings={[]} />
        <TicketTable tickets={filtered} isLoading={isLoading} />
        <FaqQuickLinks />
      </section>
    </>
  );
}

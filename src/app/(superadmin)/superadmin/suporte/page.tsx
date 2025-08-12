"use client";

import Head from "next/head";
import { useState } from "react";
import HeaderSuporte from "@/components/superadmin/HeaderSuporte";
import TicketTable from "@/components/superadmin/TicketTable";
import CardOnboardingPendentes from "@/components/superadmin/CardOnboardingPendentes";
import FaqQuickLinks from "@/components/superadmin/FaqQuickLinks";
import { mockTickets, mockOnboardings } from "@/components/lists/mockSuporte";

const SEO = {
  title: "Central de Suporte e Onboarding | Fut7Pro SuperAdmin",
  description:
    "Gerencie tickets, onboarding e suporte SaaS dos rachas Fut7Pro. Painel completo de helpdesk, FAQ e acompanhamento do onboarding dos clientes.",
  keywords:
    "suporte, helpdesk, onboarding, fut7, plataforma futebol, SaaS, tickets, racha, administração",
};

export default function SuporteSuperAdminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "inprogress" | "resolved" | "waiting"
  >("all");

  const tickets = mockTickets.filter(
    (t) =>
      (search === "" ||
        t.assunto.toLowerCase().includes(search.toLowerCase()) ||
        t.racha.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" || t.status === statusFilter)
  );

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
          stats={[
            { label: "Abertos", value: 4 },
            { label: "Em Andamento", value: 2 },
            { label: "Resolvidos", value: 17 },
            { label: "Média Resposta", value: "1h 45min" },
          ]}
        />

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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos</option>
            <option value="open">Abertos</option>
            <option value="inprogress">Em andamento</option>
            <option value="resolved">Resolvidos</option>
            <option value="waiting">Aguardando resposta</option>
          </select>
          <button className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-500 transition">
            Novo Ticket Manual
          </button>
        </div>

        <CardOnboardingPendentes onboardings={mockOnboardings} />
        <TicketTable tickets={tickets} />
        <FaqQuickLinks />
      </section>
    </>
  );
}

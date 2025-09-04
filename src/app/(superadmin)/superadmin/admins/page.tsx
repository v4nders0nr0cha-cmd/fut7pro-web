// src/app/superadmin/admins/page.tsx
"use client";
import Head from "next/head";
import { useState } from "react";
import AdminsResumoCard from "@/components/superadmin/AdminsResumoCard";
import AdminsTable from "@/components/superadmin/AdminsTable";
import ModalNovoAdmin from "@/components/superadmin/ModalNovoAdmin";
import { mockAdmins } from "@/components/superadmin/mockAdmins";

export default function SuperAdminAdminsPage() {
  const [open, setOpen] = useState(false);

  // SEO (Next.js 14+ usa metadata, mas manter Head para retrocompatibilidade)
  return (
    <>
      <Head>
        <title>Painel SuperAdmin – Admins e Presidentes de Racha | Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie todos os presidentes e rachas da sua plataforma SaaS Fut7Pro em um painel seguro, escalável e eficiente."
        />
        <meta
          name="keywords"
          content="Fut7Pro, SaaS, futebol, presidentes, racha, administração, plataforma esportiva, gestão de clientes"
        />
      </Head>
      <div className="px-4 pt-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-2xl font-bold text-white">Admins/Presidentes de Racha</h1>
          <button
            className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-300 transition mt-4 sm:mt-0"
            onClick={() => setOpen(true)}
          >
            + Novo Presidente
          </button>
        </div>
        <AdminsResumoCard admins={mockAdmins} />
        <AdminsTable />
        <ModalNovoAdmin open={open} onClose={() => setOpen(false)} onSave={() => {}} />
      </div>
    </>
  );
}

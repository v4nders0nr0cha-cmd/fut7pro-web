// src/app/(superadmin)/superadmin/admins/page.tsx
"use client";
import Head from "next/head";
import { useState } from "react";
import AdminsResumoCard from "@/components/superadmin/AdminsResumoCard";
import AdminsTable from "@/components/superadmin/AdminsTable";
import ModalNovoAdmin from "@/components/superadmin/ModalNovoAdmin";
import { useSuperadminUsuarios } from "@/hooks/useSuperadminUsuarios";

export default function SuperAdminAdminsPage() {
  const [open, setOpen] = useState(false);
  const { snapshot, usuarios, isLoading, error, refresh } = useSuperadminUsuarios();

  return (
    <>
      <Head>
        <title>Painel SuperAdmin - Admins e Presidentes de Racha | Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie todos os presidentes e rachas da plataforma Fut7Pro com dados em tempo real."
        />
      </Head>
      <div className="px-4 pt-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-2xl font-bold text-white">Admins e presidentes</h1>
          <div className="flex items-center gap-3">
            {error ? <span className="text-sm text-red-300">Erro ao carregar lista</span> : null}
            <button
              className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-xl font-semibold hover:bg-zinc-700 transition"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              Atualizar
            </button>
            <button
              className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-300 transition"
              onClick={() => setOpen(true)}
            >
              + Novo presidente
            </button>
          </div>
        </div>
        <AdminsResumoCard snapshot={snapshot} />
        <AdminsTable admins={usuarios} isLoading={isLoading} />
        <ModalNovoAdmin open={open} onClose={() => setOpen(false)} onSave={() => {}} />
      </div>
    </>
  );
}

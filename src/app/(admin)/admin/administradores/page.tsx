"use client";

import { useState } from "react";
import { useRachaAdmins } from "@/hooks/useRachaAdmins";
import AdminForm from "@/components/admin/AdminForm";
import AdminList from "@/components/admin/AdminList";
import RachaSelect from "@/components/admin/RachaSelect";
import Head from "next/head";

export default function AdministradoresPage() {
  const [rachaId, setRachaId] = useState<string>("");
  const { admins, addAdmin, updateAdmin, deleteAdmin } = useRachaAdmins(rachaId);
  const [editAdmin, setEditAdmin] = useState<any | undefined>(undefined);

  function handleSave(admin: any) {
    if (admin.id) updateAdmin(admin);
    else addAdmin({ ...admin, rachaId });
    setEditAdmin(undefined);
  }

  function handleEdit(admin: any) {
    setEditAdmin(admin);
  }

  function handleDelete(id: string) {
    if (window.confirm("Deseja realmente remover este administrador?")) {
      deleteAdmin(id);
    }
  }

  return (
    <>
      <Head>
        <title>Administradores do Racha | Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie a equipe de administradores do seu racha no Fut7Pro. Adicione, edite e remova administradores com total segurança e controle."
        />
        <meta
          name="keywords"
          content="fut7, racha, administrador, presidente, vice, diretor, gestor, gestão esportiva, futebol 7, SaaS"
        />
      </Head>
      <section className="max-w-4xl mx-auto pt-20 pb-24 md:pt-10 md:pb-12 px-2">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 text-center mb-7">
          Administradores do Racha
        </h1>
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <RachaSelect value={rachaId} onChange={setRachaId} />
          </div>
        </div>
        <div className="mb-7 bg-[#22232a] border border-[#2a2a2e] rounded-2xl px-6 py-5 shadow-sm">
          <AdminForm
            onSave={handleSave}
            initialData={editAdmin}
            onCancel={() => setEditAdmin(undefined)}
          />
        </div>
        <div className="bg-[#22232a] border border-[#2a2a2e] rounded-2xl px-4 py-5 shadow-sm">
          <AdminList admins={admins} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </section>
    </>
  );
}

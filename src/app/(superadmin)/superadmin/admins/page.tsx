// src/app/superadmin/admins/page.tsx
"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import { useBranding } from "@/hooks/useBranding";
import AdminsResumoCard from "@/components/superadmin/AdminsResumoCard";
import AdminsTable, { type Admin as AdminRow } from "@/components/superadmin/AdminsTable";
import ModalNovoAdmin, {
  type CreatePresidentePayload,
  type SaveResult,
} from "@/components/superadmin/ModalNovoAdmin";
import ModalEditarAdmin, { type EditAdminPayload } from "@/components/superadmin/ModalEditarAdmin";
import ModalDetalhesAdmin, { type AdminDetalhes } from "@/components/superadmin/ModalDetalhesAdmin";
import ModalSenhaResetada from "@/components/superadmin/ModalSenhaResetada";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Role, Permission } from "@/common/enums";
import type { Usuario } from "@/types/superadmin";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ATHLETE: [Permission.USER_READ, Permission.RACHA_READ, Permission.ANALYTICS_READ],
  ATLETA: [Permission.USER_READ, Permission.RACHA_READ, Permission.ANALYTICS_READ],
  ADMIN: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.RACHA_READ,
    Permission.RACHA_UPDATE,
    Permission.RACHA_MANAGE_ADMINS,
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.CONFIG_READ,
    Permission.CONFIG_UPDATE,
    Permission.ANALYTICS_READ,
    Permission.REPORTS_GENERATE,
    Permission.SUPPORT_READ,
    Permission.SUPPORT_CREATE,
    Permission.SUPPORT_UPDATE,
  ],
  SUPERADMIN: Object.values(Permission),
  GERENTE: [
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.RACHA_READ,
    Permission.RACHA_UPDATE,
    Permission.RACHA_MANAGE_ADMINS,
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.CONFIG_READ,
    Permission.CONFIG_UPDATE,
    Permission.ANALYTICS_READ,
    Permission.REPORTS_GENERATE,
  ],
  SUPORTE: [
    Permission.USER_READ,
    Permission.RACHA_READ,
    Permission.CONFIG_READ,
    Permission.SUPPORT_READ,
    Permission.SUPPORT_CREATE,
    Permission.SUPPORT_UPDATE,
  ],
  AUDITORIA: [
    Permission.ANALYTICS_READ,
    Permission.REPORTS_GENERATE,
    Permission.AUDIT_READ,
    Permission.AUDIT_CREATE,
    Permission.AUDIT_EXPORT,
  ],
  FINANCEIRO: [
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_APPROVE,
    Permission.ANALYTICS_READ,
  ],
  MARKETING: [Permission.ANALYTICS_READ, Permission.REPORTS_GENERATE, Permission.CONFIG_READ],
};

function resolveRole(raw?: string | null): Role {
  const value = (raw || "").toUpperCase();
  if (value === "SUPERADMIN") return Role.SUPERADMIN;
  if (value === "ADMIN") return Role.ADMIN;
  if (value === "ATHLETE") return Role.ATHLETE;
  if (value === "ATLETA") return Role.ATLETA;
  if (
    value === "PRESIDENTE" ||
    value === "VICE_PRESIDENTE" ||
    value === "DIRETOR_FUTEBOL" ||
    value === "DIRETOR_FINANCEIRO"
  ) {
    return Role.ADMIN;
  }
  return Role.ADMIN;
}

export default function SuperAdminAdminsPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);
  const [open, setOpen] = useState(false);
  const { usuarios, isLoading, rachas, refreshAll } = useSuperAdmin();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminDetalhes | null>(null);
  const [editAdmin, setEditAdmin] = useState<EditAdminPayload | null>(null);
  const [resetPayload, setResetPayload] = useState<{ email: string; password: string } | null>(
    null
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const usuarioPorId = useMemo(() => {
    return new Map((usuarios || []).map((usuario) => [usuario.id, usuario]));
  }, [usuarios]);

  const rachaPorId = useMemo(() => {
    return new Map((rachas || []).map((racha) => [racha.id, racha]));
  }, [rachas]);

  async function handleCreatePresidente(payload: CreatePresidentePayload): Promise<SaveResult> {
    const response = await fetch("/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || text || "Erro ao criar presidente.";
      throw new Error(message);
    }

    await refreshAll();

    return {
      message: body?.message || "Presidente criado com sucesso.",
      temporaryPassword: body?.temporaryPassword || undefined,
      adminEmail: payload.adminEmail?.trim().toLowerCase(),
      tenantName: payload.rachaNome || undefined,
    };
  }

  const adminsParaTabela = useMemo<AdminRow[]>(() => {
    const adminRoleSet = new Set([
      "ADMIN",
      "SUPERADMIN",
      "PRESIDENTE",
      "VICE_PRESIDENTE",
      "DIRETOR_FUTEBOL",
      "DIRETOR_FINANCEIRO",
    ]);

    return (usuarios || []).flatMap((usuario: Usuario) => {
      const memberships = usuario.memberships ?? [];
      const userName = usuario.nome || usuario.name || "Administrador";
      const userEmail = usuario.email || "sem-email";
      const isUserActive = usuario.ativo !== false;

      const rows = memberships
        .filter((membership) =>
          adminRoleSet.has(String(membership.role || usuario.role || "ADMIN").toUpperCase())
        )
        .map((membership) => {
          const roleRaw = String(membership.role || usuario.role || "ADMIN").toUpperCase();
          const permissionRole = resolveRole(roleRaw);
          const isApproved = String(membership.status || "").toUpperCase() === "APROVADO";

          return {
            id: membership.id || `${usuario.id}-${membership.tenantId || "sem-racha"}-${roleRaw}`,
            userId: usuario.id,
            name: userName,
            email: userEmail,
            role: roleRaw,
            superadmin: roleRaw === "SUPERADMIN" || Boolean(usuario.superadmin),
            active: isUserActive && isApproved,
            status: membership.status,
            createdAt: membership.createdAt || usuario.criadoEm || new Date(),
            updatedAt: usuario.atualizadoEm || usuario.criadoEm || new Date(),
            permissions: ROLE_PERMISSIONS[permissionRole] || [],
            tenantId: membership.tenantId,
            tenantNome: membership.tenantNome,
            tenantSlug: membership.tenantSlug,
          };
        });

      return rows;
    });
  }, [usuarios]);

  function buildAdminDetails(admin: AdminRow): AdminDetalhes | null {
    const usuario = usuarioPorId.get(admin.userId);
    if (!usuario) return null;
    const tenant = admin.tenantId ? rachaPorId.get(admin.tenantId) : null;

    return {
      id: admin.userId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      active: admin.active,
      tenantNome: admin.tenantNome || tenant?.nome || null,
      tenantSlug: admin.tenantSlug || tenant?.slug || null,
      createdAt: usuario.criadoEm || null,
      updatedAt: usuario.atualizadoEm || usuario.criadoEm || null,
    };
  }

  function handleView(admin: AdminRow) {
    const details = buildAdminDetails(admin);
    if (!details) return;
    setSelectedAdmin(details);
    setDetailsOpen(true);
  }

  function handleEdit(admin: AdminRow) {
    const usuario = usuarioPorId.get(admin.userId);
    if (!usuario) return;
    setEditAdmin({
      id: usuario.id,
      name: usuario.nome || usuario.name || "",
      email: usuario.email || "",
      role: resolveRole(usuario.role),
      tenantId: usuario.tenantId || null,
    });
    setEditOpen(true);
  }

  async function handleUpdateAdmin(payload: EditAdminPayload) {
    setPendingId(payload.id);
    setActionError(null);
    setActionSuccess(null);

    const response = await fetch(`/api/superadmin/usuarios/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId ?? null,
      }),
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || text || "Erro ao atualizar admin.";
      setPendingId(null);
      throw new Error(message);
    }

    await refreshAll();
    setActionSuccess("Admin atualizado com sucesso.");
    setPendingId(null);
  }

  async function handleResetPassword(admin: AdminRow) {
    if (!admin.userId) return;
    if (!window.confirm(`Resetar senha de ${admin.email}?`)) return;

    setPendingId(admin.userId);
    setActionError(null);
    setActionSuccess(null);

    const response = await fetch(`/api/superadmin/usuarios/${admin.userId}/reset-password`, {
      method: "POST",
    });

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || text || "Erro ao resetar senha.";
      setPendingId(null);
      setActionError(message);
      return;
    }

    setResetPayload({
      email: admin.email,
      password: body?.temporaryPassword || "",
    });
    setResetOpen(true);
    setActionSuccess("Senha resetada com sucesso.");
    setPendingId(null);
  }

  async function handleDelete(admin: AdminRow) {
    if (!admin.userId) return;
    if (!admin.tenantId) {
      setActionError("Nao foi possivel identificar o racha deste admin.");
      return;
    }
    const label = admin.tenantNome || admin.tenantSlug || "racha";
    const confirmText = `Remover ${admin.email} do racha ${label}?\\n\\nIsso remove apenas o vinculo/permissao administrativa deste racha. A conta global nao sera apagada.`;
    if (!window.confirm(confirmText)) return;

    setPendingId(admin.id);
    setActionError(null);
    setActionSuccess(null);

    const response = await fetch(
      `/api/superadmin/tenants/${admin.tenantId}/admins/${admin.userId}`,
      { method: "DELETE" }
    );

    const text = await response.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const message = body?.message || body?.error || text || "Erro ao remover admin do racha.";
      setPendingId(null);
      setActionError(message);
      return;
    }

    await refreshAll();
    setActionSuccess("Admin removido do racha.");
    setPendingId(null);
  }

  return (
    <>
      <Head>
        <title>{brandText("Painel SuperAdmin - Admins e Presidentes de Racha | Fut7Pro")}</title>
        <meta
          name="description"
          content={brandText(
            "Gerencie todos os presidentes e rachas da sua plataforma SaaS Fut7Pro em um painel seguro, escalavel e eficiente."
          )}
        />
        <meta
          name="keywords"
          content={brandText(
            "Fut7Pro, SaaS, futebol, presidentes, racha, administracao, plataforma esportiva, gestao de clientes"
          )}
        />
      </Head>
      <div className="w-full min-h-screen">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="flex-1 min-w-0 text-2xl font-bold text-white">
            Admins/Presidentes de Racha
          </h1>
          <button
            className="bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold hover:bg-yellow-300 transition whitespace-nowrap w-full sm:w-auto"
            onClick={() => setOpen(true)}
          >
            + Criar Presidente Manual
          </button>
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-600/60 bg-red-900/30 px-4 py-3 text-sm text-red-200 flex items-center justify-between">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-red-200 hover:text-white"
            >
              Fechar
            </button>
          </div>
        )}
        {actionSuccess && (
          <div className="mb-4 rounded-lg border border-emerald-600/60 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200 flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-200 hover:text-white"
            >
              Fechar
            </button>
          </div>
        )}

        <AdminsResumoCard admins={rachas || []} />
        <AdminsTable
          admins={adminsParaTabela}
          isLoading={isLoading}
          pendingId={pendingId}
          onView={handleView}
          onEdit={handleEdit}
          onResetPassword={handleResetPassword}
          onDelete={handleDelete}
        />
        <ModalNovoAdmin
          open={open}
          onClose={() => setOpen(false)}
          onSave={handleCreatePresidente}
          rachas={rachas}
          usuarios={usuarios}
        />
        <ModalDetalhesAdmin
          open={detailsOpen}
          admin={selectedAdmin}
          onClose={() => setDetailsOpen(false)}
        />
        <ModalEditarAdmin
          open={editOpen}
          admin={editAdmin}
          rachas={rachas}
          onClose={() => setEditOpen(false)}
          onSave={handleUpdateAdmin}
        />
        <ModalSenhaResetada
          open={resetOpen}
          email={resetPayload?.email}
          temporaryPassword={resetPayload?.password}
          onClose={() => setResetOpen(false)}
        />
      </div>
    </>
  );
}

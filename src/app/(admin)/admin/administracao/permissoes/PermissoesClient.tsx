"use client";

import { useMemo } from "react";
import { BadgeCargo } from "@/components/admin/BadgeCargo";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import type { AdminRoleKey, AdminRoleSlot } from "@/types/admin-roles";
import type { CargoAdmin } from "@/types/admin";

type PermissionRow = {
  role: AdminRoleKey;
  cargo: CargoAdmin;
  titulo: string;
  podeAcessar: string[];
  podeEditar: string[];
  podeExcluir: string[];
  prazoExclusaoDias: number | null;
};

type StatusLabel = AdminRoleSlot["status"] | "LOADING";

type ChipTone = "access" | "edit" | "delete";

const PERMISSION_ROWS: PermissionRow[] = [
  {
    role: "PRESIDENTE",
    cargo: "Presidente",
    titulo: "Presidente",
    podeAcessar: [
      "Administração",
      "Configurações/Extras",
      "Partidas",
      "Times do Dia",
      "Jogadores",
      "Conquistas",
      "Rankings & Estatísticas",
      "Financeiro",
      "Patrocinadores",
      "Comunicação",
      "Personalização",
    ],
    podeEditar: [
      "Administradores",
      "Permissões",
      "Logs/Admin",
      "Transferir Propriedade",
      "Configurações críticas",
      "Partidas",
      "Jogadores",
      "Conquistas",
      "Rankings & Estatísticas",
      "Financeiro",
      "Patrocinadores",
      "Comunicação",
      "Personalização",
    ],
    podeExcluir: [
      "Partidas",
      "Rankings",
      "Campeões",
      "Atletas",
      "Lançamentos financeiros",
      "Patrocinadores",
    ],
    prazoExclusaoDias: null,
  },
  {
    role: "VICE_PRESIDENTE",
    cargo: "Vice",
    titulo: "Vice-Presidente",
    podeAcessar: [
      "Partidas",
      "Times do Dia",
      "Jogadores",
      "Conquistas",
      "Rankings & Estatísticas",
      "Financeiro",
      "Patrocinadores",
      "Comunicação",
      "Personalização",
    ],
    podeEditar: [
      "Partidas",
      "Times do Dia",
      "Jogadores",
      "Conquistas",
      "Rankings & Estatísticas",
      "Financeiro (lançamentos)",
      "Patrocinadores",
      "Comunicação",
      "Personalização",
    ],
    podeExcluir: ["Partidas", "Rankings", "Campeões"],
    prazoExclusaoDias: 15,
  },
  {
    role: "DIRETOR_FUTEBOL",
    cargo: "Diretor de Futebol",
    titulo: "Diretor de Futebol",
    podeAcessar: ["Partidas", "Times do Dia", "Jogadores", "Conquistas", "Rankings & Estatísticas"],
    podeEditar: ["Partidas", "Times do Dia", "Conquistas (desempenho)", "Rankings & Estatísticas"],
    podeExcluir: ["Partidas", "Rankings", "Campeões"],
    prazoExclusaoDias: 15,
  },
  {
    role: "DIRETOR_FINANCEIRO",
    cargo: "Diretor Financeiro",
    titulo: "Diretor Financeiro",
    podeAcessar: [
      "Financeiro",
      "Prestação de contas",
      "Mensalidades",
      "Patrocinadores",
      "Relatórios financeiros",
      "Partidas (leitura)",
    ],
    podeEditar: ["Financeiro", "Prestação de contas", "Mensalidades", "Patrocinadores"],
    podeExcluir: [],
    prazoExclusaoDias: 15,
  },
];

const STATUS_STYLES: Record<StatusLabel, { label: string; className: string }> = {
  ACTIVE: {
    label: "Ativo",
    className: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-orange-500/20 text-orange-200 border border-orange-500/30",
  },
  EMPTY: {
    label: "Vazio",
    className: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  },
  LOADING: {
    label: "Carregando",
    className: "bg-zinc-800 text-zinc-400 border border-zinc-700",
  },
};

const CHIP_STYLES: Record<ChipTone, string> = {
  access: "bg-zinc-800 text-zinc-200 border border-zinc-700",
  edit: "bg-blue-500/15 text-blue-200 border border-blue-500/30",
  delete: "bg-red-500/15 text-red-200 border border-red-500/30",
};

function ChipList({ items, tone }: { items: string[]; tone: ChipTone }) {
  if (!items.length) {
    return <span className="text-zinc-500 italic text-xs">Nenhuma</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`px-2 py-0.5 rounded text-xs font-medium ${CHIP_STYLES[tone]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function renderPrazo(prazoExclusaoDias: number | null) {
  if (prazoExclusaoDias === null) {
    return (
      <span className="bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded text-xs font-semibold border border-yellow-500/30">
        Sem limite
      </span>
    );
  }

  return (
    <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-xs font-medium border border-zinc-700">
      {prazoExclusaoDias} dias
    </span>
  );
}

function resolveOccupantInfo(slot: AdminRoleSlot | undefined, isLoading: boolean) {
  if (isLoading) {
    return { label: "Carregando ocupante...", detail: null };
  }

  if (!slot || slot.status === "EMPTY") {
    return { label: "Nenhum definido", detail: null };
  }

  const label = slot.name || slot.nickname || slot.email || "Administrador";
  const detail =
    slot.email && slot.email !== label
      ? slot.email
      : slot.nickname && slot.nickname !== label
        ? slot.nickname
        : null;

  return { label, detail };
}

export default function PermissoesClient() {
  const { slots, isLoading, isError, error, mutate } = useAdminRoles();
  const slotMap = useMemo(() => {
    return slots.reduce<Partial<Record<AdminRoleKey, AdminRoleSlot>>>((acc, slot) => {
      acc[slot.role] = slot;
      return acc;
    }, {});
  }, [slots]);

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
          Permissões dos Administradores
        </h1>
        <p className="text-zinc-300">
          Veja com clareza o que cada cargo pode acessar, editar e excluir. Essas regras são
          aplicadas automaticamente no painel.
        </p>
      </div>

      <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-zinc-200">
          <span className="font-semibold text-yellow-300">Somente o Presidente</span> pode alterar
          administradores e permissões.
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/administracao/administradores"
            className="px-3 py-2 rounded-lg border border-yellow-500/40 text-yellow-200 text-xs font-semibold hover:bg-yellow-500/10"
          >
            Ir para Administradores
          </a>
          <a
            href="/admin/administracao/logs"
            className="px-3 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-xs font-semibold hover:bg-zinc-700/40"
          >
            Ver Logs/Admin
          </a>
        </div>
      </div>

      {isError && (
        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <span>
            Não foi possível carregar os ocupantes. As permissões continuam visíveis.
            {error ? ` (${error})` : ""}
          </span>
          <button
            type="button"
            onClick={() => mutate()}
            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-[#202126] rounded-2xl shadow border border-[#2a2d34]">
          <thead>
            <tr className="text-zinc-400 text-sm border-b border-[#292929]">
              <th className="py-3 px-4 text-left font-semibold">Cargo</th>
              <th className="py-3 px-4 font-semibold">Pode acessar</th>
              <th className="py-3 px-4 font-semibold">Pode editar</th>
              <th className="py-3 px-4 font-semibold">Pode excluir</th>
              <th className="py-3 px-4 font-semibold">Prazo de exclusão</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map((perm) => {
              const slot = slotMap[perm.role];
              const status: StatusLabel = isLoading ? "LOADING" : (slot?.status ?? "EMPTY");
              const statusStyle = STATUS_STYLES[status];
              const occupant = resolveOccupantInfo(slot, isLoading);
              return (
                <tr
                  key={perm.role}
                  className="border-b border-[#242429] hover:bg-[#242529] transition"
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <BadgeCargo cargo={perm.cargo} minimal />
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyle.className}`}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">{perm.titulo}</span>
                      <span className="text-xs text-zinc-500">{occupant.label}</span>
                      {occupant.detail && (
                        <span className="text-[11px] text-zinc-600">{occupant.detail}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top">
                    <ChipList items={perm.podeAcessar} tone="access" />
                  </td>
                  <td className="py-3 px-4 align-top">
                    <ChipList items={perm.podeEditar} tone="edit" />
                  </td>
                  <td className="py-3 px-4 align-top">
                    <ChipList items={perm.podeExcluir} tone="delete" />
                  </td>
                  <td className="py-3 px-4 align-top">{renderPrazo(perm.prazoExclusaoDias)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {PERMISSION_ROWS.map((perm) => {
          const slot = slotMap[perm.role];
          const status: StatusLabel = isLoading ? "LOADING" : (slot?.status ?? "EMPTY");
          const statusStyle = STATUS_STYLES[status];
          const occupant = resolveOccupantInfo(slot, isLoading);
          return (
            <div key={perm.role} className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <BadgeCargo cargo={perm.cargo} minimal />
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyle.className}`}>
                  {statusStyle.label}
                </span>
              </div>
              <div className="mt-2 text-xs text-zinc-400">{perm.titulo}</div>
              <div className="mt-1 text-xs text-zinc-500">{occupant.label}</div>
              {occupant.detail && (
                <div className="text-[11px] text-zinc-600">{occupant.detail}</div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                    Pode acessar
                  </div>
                  <ChipList items={perm.podeAcessar} tone="access" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                    Pode editar
                  </div>
                  <ChipList items={perm.podeEditar} tone="edit" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                    Pode excluir
                  </div>
                  <ChipList items={perm.podeExcluir} tone="delete" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                    Prazo de exclusão
                  </div>
                  {renderPrazo(perm.prazoExclusaoDias)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-4 text-sm text-zinc-300">
        <div className="font-semibold text-yellow-300 mb-2">Entenda as colunas</div>
        <ul className="space-y-1 text-xs text-zinc-400">
          <li>"Pode acessar": permite visualizar módulos e navegar nas telas listadas.</li>
          <li>"Pode editar": permite criar e alterar dados nesses módulos.</li>
          <li>"Pode excluir": remoções definitivas, respeitando o prazo indicado.</li>
          <li>"Prazo de exclusão": janela para desfazer exclusões, quando aplicável.</li>
        </ul>
      </div>
    </div>
  );
}

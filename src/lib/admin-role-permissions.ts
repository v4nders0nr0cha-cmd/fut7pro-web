import type { CargoAdmin } from "@/types/admin";
import type { AdminRoleKey } from "@/types/admin-roles";

export type AdminRolePermissionRow = {
  role: AdminRoleKey;
  cargo: CargoAdmin;
  titulo: string;
  podeAcessar: string[];
  podeEditar: string[];
  podeExcluir: string[];
  prazoExclusaoDias: number | null;
};

export const ADMIN_ROLE_PERMISSION_ROWS: AdminRolePermissionRow[] = [
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

const ADMIN_ROLE_PERMISSION_ROWS_BY_ROLE = new Map(
  ADMIN_ROLE_PERMISSION_ROWS.map((row) => [row.role, row])
);

export function getAdminRolePermissionRow(role?: string | null) {
  const normalizedRole = String(role || "").toUpperCase() as AdminRoleKey;
  return ADMIN_ROLE_PERMISSION_ROWS_BY_ROLE.get(normalizedRole) ?? null;
}

export function getEffectiveAdminRolePermissions(role?: string | null) {
  const row = getAdminRolePermissionRow(role);
  if (!row) return [];

  return [
    ...row.podeAcessar.map((item) => `Acessar: ${item}`),
    ...row.podeEditar.map((item) => `Editar: ${item}`),
    ...row.podeExcluir.map((item) => `Excluir: ${item}`),
  ];
}

export function getAdminRolePermissionCount(role?: string | null) {
  return getEffectiveAdminRolePermissions(role).length;
}

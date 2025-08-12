// src/components/superadmin/mockAdmins.ts
export type AdminStatus = "ativo" | "trial" | "bloqueado" | "suspenso";
export interface AdminRacha {
  id: string;
  nome: string;
  logo: string;
  status: AdminStatus;
  presidente: string;
  email: string;
  criadoEm: string;
}

export const mockAdmins: AdminRacha[] = [
  {
    id: "1",
    nome: "Racha Vila União",
    logo: "/images/logos/logo_racha_vila_uniao.png",
    status: "ativo",
    presidente: "João Silva",
    email: "joao@exemplo.com",
    criadoEm: "2024-06-02",
  },
  {
    id: "2",
    nome: "Racha Galáticos",
    logo: "/images/logos/logo_racha_galaticos.png",
    status: "trial",
    presidente: "Pedro Souza",
    email: "pedro@exemplo.com",
    criadoEm: "2024-06-10",
  },
  {
    id: "3",
    nome: "Racha Real Matismo",
    logo: "/images/logos/logo_real_matismo.png",
    status: "ativo",
    presidente: "Paulo Lima",
    email: "paulo@exemplo.com",
    criadoEm: "2024-05-14",
  },
  {
    id: "4",
    nome: "Racha Atletas da Bola",
    logo: "/images/logos/logo_atletas_bola.png",
    status: "bloqueado",
    presidente: "Felipe Costa",
    email: "felipe@exemplo.com",
    criadoEm: "2024-03-21",
  },
];

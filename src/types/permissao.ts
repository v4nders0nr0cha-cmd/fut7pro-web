// src/types/permissao.ts
import type { CargoAdmin } from "./admin";

export interface PermissaoAdmin {
  funcao: CargoAdmin;
  podeAcessar: {
    administradores: boolean;
    permissoes: boolean;
    logs: boolean;
    transferirPropriedade: boolean;
    partidas: boolean;
    jogadores: boolean;
    financeiro: boolean;
  };
  podeExcluir: {
    partidas: boolean;
    rankings: boolean;
    campeoes: boolean;
    atletas: boolean;
  };
  prazoExclusaoDias: number | null;
}

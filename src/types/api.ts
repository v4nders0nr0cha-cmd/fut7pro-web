// Tipos para APIs - substituindo any

export interface RachaData {
  id: string;
  nome: string;
  slug: string;
  logo: string;
  cor: string;
  descricao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface JogadorData {
  id: string;
  nome: string;
  apelido?: string;
  nickname?: string;
  email: string;
  foto: string;
  photoUrl?: string;
  posicao: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  status: "ativo" | "inativo" | "suspenso";
  mensalista?: boolean;
  isMember?: boolean;
  criadoEm: string;
}

export interface PartidaData {
  id: string;
  data: string;
  horario: string;
  timeA: string;
  timeB: string;
  golsTimeA?: number;
  golsTimeB?: number;
  status: "agendada" | "em_andamento" | "finalizada" | "cancelada";
  criadoEm: string;
}

export interface FinanceiroData {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: "pago" | "pendente" | "atrasado";
  criadoEm: string;
}

export interface EstatisticaData {
  jogadorId: string;
  jogadorNome: string;
  jogadorFoto: string;
  gols: number;
  assistencias: number;
  partidas: number;
  pontos: number;
}

export interface ConfiguracaoData {
  tema: string;
  cores: {
    primary: string;
    secondary: string;
    accent: string;
  };
  configuracoes: {
    allowPlayerRegistration: boolean;
    allowMatchCreation: boolean;
    allowFinancialManagement: boolean;
    allowNotifications: boolean;
    allowStatistics: boolean;
    allowRankings: boolean;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserData {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface ApiRequestData {
  racha?: RachaData;
  jogador?: JogadorData;
  partida?: PartidaData;
  financeiro?: FinanceiroData;
  configuracao?: ConfiguracaoData;
  auth?: AuthCredentials | UserData | RefreshTokenData;
  [key: string]: unknown;
}

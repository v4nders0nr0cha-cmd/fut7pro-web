export type LoginRequest = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    rachaId?: string | null;
  };
};

export type RefreshRequest = { refreshToken: string };
export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string; // opcional, caso o backend emita um novo
  expiresIn: number; // segundos
};

export type MeResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  rachaId?: string | null;
};

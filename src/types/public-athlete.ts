import type { ConquistasAtleta } from "@/types/estatisticas";

export type PublicAthleteProfile = {
  id: string;
  slug: string;
  firstName: string;
  nickname?: string | null;
  position?: string | null;
  positionSecondary?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  mensalista?: boolean | null;
  adminRole?: string | null;
};

export type PublicAthleteResponse = {
  slug: string;
  athlete: PublicAthleteProfile | null;
  conquistas: ConquistasAtleta;
};

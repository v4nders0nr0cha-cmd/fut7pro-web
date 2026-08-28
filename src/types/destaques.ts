export type DestaqueDiaFaltou = Partial<
  Record<"atacante" | "meia" | "goleiro" | "zagueiro", boolean>
>;

export type DestaqueDiaResponse = {
  id?: string;
  date: string | null;
  bannerUrl: string | null;
  zagueiroId: string | null;
  faltou?: DestaqueDiaFaltou | null;
  timeCampeaoDoDia?: {
    id: string;
    teamId: string;
    source: "manual" | "calculated";
    status: "draft" | "published";
    updatedAt: string;
    team: {
      id: string;
      name: string;
      color: string | null;
      logoUrl: string | null;
    } | null;
    atletas?: Array<{
      id: string;
      athleteId: string;
      positionPrincipal: string | null;
      positionEfetiva: string | null;
      presenceStatus: "TITULAR" | "SUBSTITUTO" | "AUSENTE";
      athlete: {
        id: string;
        name: string;
        nickname: string | null;
        photoUrl: string | null;
        position: string | null;
      };
    }>;
  } | null;
  publication?: {
    scope: "historical" | "public_spotlight";
    shouldUpdatePublicSpotlight: boolean;
    latestCompletedMatchDate: string | null;
    message: string;
  } | null;
  updatedAt?: string | null;
};

export type PublicDestaquesDoDiaResponse = {
  slug: string;
  destaque: DestaqueDiaResponse | null;
};

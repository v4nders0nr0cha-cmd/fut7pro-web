export type DestaqueDiaFaltou = Partial<
  Record<"atacante" | "meia" | "goleiro" | "zagueiro", boolean>
>;

export type DestaqueDiaResponse = {
  id?: string;
  date: string | null;
  bannerUrl: string | null;
  zagueiroId: string | null;
  faltou?: DestaqueDiaFaltou | null;
  updatedAt?: string | null;
};

export type PublicDestaquesDoDiaResponse = {
  slug: string;
  destaque: DestaqueDiaResponse | null;
};

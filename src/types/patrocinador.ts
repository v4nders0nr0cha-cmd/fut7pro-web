export type SponsorTier = "BASIC" | "PLUS" | "PRO";

export type PatrocinadorStatus = "ativo" | "em_breve" | "expirado";

export type Patrocinador = {
  id: string;
  tenantId?: string;
  name: string;
  logoUrl: string;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  coupon?: string | null;
  benefit?: string | null;
  value?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  displayOrder: number;
  tier: SponsorTier;
  showOnFooter: boolean;
  status?: PatrocinadorStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type PatrocinadorPayload = Partial<
  Omit<Patrocinador, "id" | "createdAt" | "updatedAt" | "tenantId" | "status">
>;

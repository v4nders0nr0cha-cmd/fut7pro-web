export type PublicSponsorStatus = "ativo" | "em_breve" | "expirado";

export type PublicSponsor = {
  id: string;
  name: string;
  logoUrl: string;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  benefit?: string | null;
  coupon?: string | null;
  value?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  displayOrder?: number | null;
  tier?: string | null;
  showOnFooter?: boolean | null;
  status?: PublicSponsorStatus | string | null;
};

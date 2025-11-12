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

export type SponsorMetricStatus = "on_track" | "attention" | "critical";

export type SponsorMetricsGoal = {
  impressions: number;
  clicks: number;
  ctr: number;
};

export type SponsorMetricsSponsor = {
  sponsorId: string;
  name: string;
  tier: SponsorTier;
  showOnFooter: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
  goals: SponsorMetricsGoal;
  status: SponsorMetricStatus;
  firstEvent: string | null;
  lastEvent: string | null;
};

export type SponsorMetricsTier = {
  tier: SponsorTier;
  impressions: number;
  clicks: number;
  ctr: number;
  sponsors: number;
  goals: SponsorMetricsGoal;
  status: SponsorMetricStatus;
};

export type SponsorMetricsTrendPoint = {
  bucket: string;
  impressions: number;
  clicks: number;
};

export type SponsorMetricsAlert = {
  type: "warning" | "critical";
  message: string;
  sponsorId?: string;
  tier?: SponsorTier;
};

export type SponsorMetricsSummary = {
  period: {
    start: string;
    end: string;
    days: number;
    granularity: "day" | "week" | "month";
  };
  totals: {
    impressions: number;
    clicks: number;
    ctr: number;
    uniqueSponsors: number;
    goals: SponsorMetricsGoal;
  };
  tiers: SponsorMetricsTier[];
  sponsors: SponsorMetricsSponsor[];
  trend: SponsorMetricsTrendPoint[];
  alerts: SponsorMetricsAlert[];
  generatedAt: string;
};

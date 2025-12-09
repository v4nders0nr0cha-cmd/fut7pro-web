export type AnalyticsPeriod = "day" | "week" | "month" | "year" | "all";

export type AnalyticsSummary = {
  visits: number;
  uniqueVisitors: number;
  engagements: number;
  avgSessionSeconds: number;
  playersActive: number;
  newPlayers: number;
  matchesPublished: number;
  sponsorsClicks: number;
  revenue?: number;
  cost?: number;
  roi?: number;
};

export type AnalyticsTimeseriesPoint = {
  date: string; // ISO date (yyyy-mm-dd)
  visits: number;
  uniqueVisitors: number;
  engagements: number;
};

export type AnalyticsEvent = {
  timestamp: string; // ISO datetime
  type: string;
  actor?: string;
  label: string;
  details?: string;
};

export type SponsorAnalytics = {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc?: number;
  cpm?: number;
  roi?: number | null;
  revenue?: number | null;
  cost?: number | null;
  series?: { date: string; impressions: number; clicks: number }[];
};

export type AdminAnalyticsResponse = {
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
  summary: AnalyticsSummary;
  timeseries: AnalyticsTimeseriesPoint[];
  events: AnalyticsEvent[];
  sponsors?: SponsorAnalytics;
};

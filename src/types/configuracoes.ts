import type { ThemeKey } from "@/config/themes";

export type ThemeCustomColors = {
  primary?: string;
  secondary?: string;
  accent?: string;
};

export interface TenantFeatureSettings {
  allowPlayerRegistration: boolean;
  allowMatchCreation: boolean;
  allowFinancialManagement: boolean;
  allowNotifications: boolean;
  allowStatistics: boolean;
  allowRankings: boolean;
}

export interface TenantConfigResponse {
  id: string;
  tenantId: string;
  tenantSlug?: string | null;
  theme: ThemeKey;
  customColors?: ThemeCustomColors | null;
  settings: TenantFeatureSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCatalogItem {
  id: string;
  key: ThemeKey;
  name: string;
  primary: string;
  secondary: string;
  highlight: string;
  text: string;
  background: string;
  surface: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationCampaignStatus = "PENDING" | "SENT" | "ERROR" | "CANCELED";
export type NotificationCampaignDestination = "ALL_ADMINS" | "PRESIDENTS_ACTIVE" | "NEW_TENANTS";
export type NotificationCampaignPriority = "NORMAL" | "HIGH";

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  category?: string | null;
  destination: NotificationCampaignDestination;
  status: NotificationCampaignStatus;
  priority: NotificationCampaignPriority;
  channels?: string[];
  badge?: boolean;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  expiresAt?: string | null;
  newTenantDays?: number | null;
  totalTenants?: number | null;
  tenantCount?: number | null;
  totalAdmins?: number | null;
  sentCount?: number | null;
  readCount?: number | null;
  unreadCount?: number | null;
  errorCount?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface NotificationCampaignPreview {
  tenants: number;
  admins: number;
  newTenantDays?: number;
  sampleTenants?: Array<{ id: string; name: string; slug: string }>;
}

export interface NotificationCampaignRecipient {
  tenantId: string;
  name: string;
  slug: string;
  sent: number;
  read: number;
  unread: number;
}

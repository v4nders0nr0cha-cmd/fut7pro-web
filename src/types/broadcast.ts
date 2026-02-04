export type BroadcastChannel = "BADGE" | "PUSH" | "EMAIL" | "WHATSAPP";

export type BroadcastStatus = "DRAFT" | "SENT" | "PARTIAL" | "FAILED";

export type ChannelAvailability = {
  available: boolean;
  reason: string | null;
};

export type BroadcastCounts = {
  total: number;
  eligibleByChannel: Record<BroadcastChannel, number>;
  sentByChannel: Record<BroadcastChannel, number>;
  failedByChannel: Record<BroadcastChannel, number>;
  skippedByChannel: Record<BroadcastChannel, number>;
  pendingByChannel: Record<BroadcastChannel, number>;
};

export type BroadcastHistoryItem = {
  id: string;
  groupKey: string;
  groupLabel: string;
  title?: string | null;
  message: string;
  channels: BroadcastChannel[];
  status: BroadcastStatus;
  createdAt: string;
  sentAt?: string | null;
  counts: BroadcastCounts;
  readCount?: number;
  unreadCount?: number;
};

export type BroadcastListResponse = {
  results: BroadcastHistoryItem[];
  nextCursor?: string | null;
};

export type BroadcastGroupPreview = {
  key: string;
  label: string;
  section: string;
  previewCount: number;
  eligibleByChannel: Record<BroadcastChannel, number>;
};

export type BroadcastGroupsPreviewResponse = {
  groups: BroadcastGroupPreview[];
  selected?: BroadcastGroupPreview | null;
  channelAvailability: Record<BroadcastChannel, ChannelAvailability>;
};

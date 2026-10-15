export type RecoveryEntityType = "ATHLETE" | "TEAM" | "COMUNICADO";
export type RecoveryOperationType = "ARCHIVE" | "DELETE";
export type RecoveryItemStatus = "AVAILABLE" | "RESTORED" | "EXPIRED";

export type RecoveryActor = {
  id: string;
  name: string | null;
};

export type RecoveryItem = {
  id: string;
  entityType: RecoveryEntityType;
  operationType: RecoveryOperationType;
  originalEntityId: string;
  displayLabel: string;
  performedBy: RecoveryActor | null;
  performedAt: string;
  expiresAt: string;
  status: RecoveryItemStatus;
  restoredAt: string | null;
  restoredEntityId: string | null;
};

export type RecoveryListResponse = {
  items: RecoveryItem[];
  page: number;
  limit: number;
  total: number;
};

export type RecoveryApiError = Error & {
  status?: number;
};

export type AthleteRequestStatus = "PENDENTE" | "APROVADA" | "REJEITADA";

export interface AthleteRequest {
  id: string;
  tenantId: string;
  name: string;
  nickname: string | null;
  email: string;
  position: string;
  photoUrl: string | null;
  message: string | null;
  status: AthleteRequestStatus;
  approvedAt: string | null;
  rejectedAt: string | null;
  processedById: string | null;
  createdAt: string;
  updatedAt: string;
}

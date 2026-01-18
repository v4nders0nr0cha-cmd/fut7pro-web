export type AthleteRequestStatus = "PENDENTE" | "APROVADA" | "REJEITADA";

export type AthleteRequest = {
  id: string;
  name: string;
  nickname?: string | null;
  email: string;
  position: string;
  positionSecondary?: string | null;
  photoUrl?: string | null;
  message?: string | null;
  status: AthleteRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  userId?: string | null;
  membershipStatus?: string | null;
};

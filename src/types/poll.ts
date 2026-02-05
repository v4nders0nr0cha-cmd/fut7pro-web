export type PollStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export type PollTargetType = "ALL" | "GROUP" | "INDIVIDUAL";

export type PollResultsVisibility = "REALTIME" | "AFTER_CLOSE";

export type PollOption = {
  id: string;
  text: string;
  voteCount?: number | null;
  order?: number;
};

export type PollAdminItem = {
  id: string;
  title: string;
  description?: string | null;
  status: PollStatus;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
  targetType: PollTargetType;
  targetGroupKey?: string | null;
  targetUserIds?: string[];
  targetLabel?: string | null;
  totalVotes?: number;
  recipientsCount?: number;
  allowChangeVote: boolean;
  resultsVisibility: PollResultsVisibility;
  allowMultiple: boolean;
  maxChoices?: number | null;
  isAnonymous: boolean;
  createdBy?: { id: string; name?: string | null; email?: string | null } | null;
};

export type PollAdminDetail = PollAdminItem & {
  closedBy?: { id: string; name?: string | null; email?: string | null } | null;
  options: PollOption[];
};

export type PollPublicItem = {
  id: string;
  title: string;
  description?: string | null;
  status: PollStatus;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  allowChangeVote: boolean;
  resultsVisibility: PollResultsVisibility;
  allowMultiple: boolean;
  maxChoices?: number | null;
  isAnonymous: boolean;
  totalVotes?: number | null;
  hasVoted: boolean;
  myVotes: string[];
  canVote: boolean;
  resultsVisible: boolean;
};

export type PollPublicDetail = PollPublicItem & {
  options: PollOption[];
};

export type PollPublicResults = {
  id: string;
  status: PollStatus;
  totalVotes: number;
  options: PollOption[];
};

export type PollListResponse<T> = {
  results: T[];
  nextCursor?: string | null;
};

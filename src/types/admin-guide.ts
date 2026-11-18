export type AdminGuideAction =
  | "REWARD_CLAIM"
  | "REWARD_PRESENTED"
  | "PREPARATION_CELEBRATED"
  | "FOOTBALL_INVITE_PRESENTED"
  | "FOOTBALL_INVITE_DEFERRED"
  | "FOOTBALL_STARTED"
  | "STEP_SKIPPED"
  | "STEP_SELECTED"
  | "INVITATION_COPIED"
  | "WELCOME_PRESENTED"
  | "WELCOME_SEEN"
  | "DASHBOARD_INVITE_DISMISSED"
  | "PUBLIC_SITE_OPENED"
  | "TIP_KNOWN"
  | "TIP_DISMISSED"
  | "TIP_SNOOZED"
  | "FIRST_MATCH_MODE_SELECTED"
  | "MONTHLY_MODEL_SELECTED"
  | "RESOURCE_VIEWED";

export type AdminGuidePedagogicalState = {
  revision: number;
  rewardPresentedAt?: string;
  completedTaskIds?: string[];
  preparationCelebratedAt?: string;
  footballInvitePresentedAt?: string;
  footballInviteDeferredAt?: string;
  footballInviteDeferred?: boolean;
  footballStartedAt?: string;
  currentStep?: string;
  invitationCopiedAt?: string;
  invitationChannel?: "WHATSAPP" | "INSTAGRAM";
  welcomeSeenAt?: string;
  welcomePresentedAt?: string;
  dashboardInviteDismissedAt?: string;
  publicSiteOpenedAt?: string;
  firstMatchMode?: "INTELLIGENT_DRAW" | "CLASSIC_MATCH";
  monthlyModel?: "HAS_MONTHLY_PLAYERS" | "CASUAL_ONLY" | "DECIDE_LATER";
  knownTips: string[];
  dismissedTips: string[];
  snoozedTips: Record<string, string>;
  viewedResources: string[];
};

export type AdminGuideTask = {
  id: string;
  title: string;
  requirement: "REQUIRED" | "RECOMMENDED" | "OPTIONAL" | "CONDITIONAL";
  completed: boolean;
  canAct: boolean;
  applicable: boolean;
  route: string;
};

export type AdminGuidePhase = {
  id: string;
  title: string;
  taskIds: string[];
  unlocked: boolean;
  completed: number;
  total: number;
  percentage: number;
  complete: boolean;
};

export type AdminGuideData = {
  reward?: {
    granted: boolean;
    eligible: boolean;
    days: number;
    grantedAt: string | null;
    trialEnd: string | null;
    reason: string | null;
  };
  phases?: { preparation: AdminGuidePhase; football: AdminGuidePhase };
  eligibility?: {
    eligiblePlayers: number;
    minimumPlayers: number;
    missingPlayers: number;
    preparationComplete: boolean;
    footballUnlocked: boolean;
  };
  actionAvailability?: Record<
    string,
    {
      allowed: boolean;
      reason: "PERMISSION" | "PHASE_LOCKED" | "PREVIOUS_STEPS" | "OPERATIONAL" | null;
    }
  >;
  transition?: { preparationCelebrationPending: boolean; footballInvitationPending: boolean };
  guideVersion: number;
  tenant: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    publicUrl?: string | null;
  };
  administrator: { membershipId: string; role: string; status: string };
  capabilities: Record<string, boolean>;
  pedagogicalState: AdminGuidePedagogicalState;
  pedagogicalStateUpdatedAt: string | null;
  operationalState: Record<string, unknown>;
  tasks: AdminGuideTask[];
  activationProgress: { completed: number; total: number; percentage: number; complete: boolean };
  nextAction: { taskId: string; title: string; route: string } | null;
  laterRecommendations: Array<{ id: string; applicable: boolean; route: string }>;
  notices: { identityAuthorization: string; sorteioPublication: string };
};

export type AdminGuidePatch =
  | {
      action:
        | "REWARD_CLAIM"
        | "REWARD_PRESENTED"
        | "PREPARATION_CELEBRATED"
        | "FOOTBALL_INVITE_PRESENTED"
        | "FOOTBALL_INVITE_DEFERRED"
        | "FOOTBALL_STARTED";
      expectedRevision?: number;
    }
  | { action: "STEP_SELECTED" | "STEP_SKIPPED"; tipId: string; expectedRevision?: number }
  | { action: "INVITATION_COPIED"; channel: "WHATSAPP" | "INSTAGRAM"; expectedRevision?: number }
  | {
      action:
        | "WELCOME_PRESENTED"
        | "WELCOME_SEEN"
        | "DASHBOARD_INVITE_DISMISSED"
        | "PUBLIC_SITE_OPENED";
      expectedRevision?: number;
    }
  | { action: "TIP_KNOWN" | "TIP_DISMISSED"; tipId: string; expectedRevision?: number }
  | { action: "TIP_SNOOZED"; tipId: string; snoozedUntil: string; expectedRevision?: number }
  | {
      action: "FIRST_MATCH_MODE_SELECTED";
      mode: "INTELLIGENT_DRAW" | "CLASSIC_MATCH";
      expectedRevision?: number;
    }
  | {
      action: "MONTHLY_MODEL_SELECTED";
      monthlyModel: "HAS_MONTHLY_PLAYERS" | "CASUAL_ONLY" | "DECIDE_LATER";
      expectedRevision?: number;
    }
  | { action: "RESOURCE_VIEWED"; resourceId: string; expectedRevision?: number };

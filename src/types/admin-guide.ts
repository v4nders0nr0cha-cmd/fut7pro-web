export type AdminGuideAction =
  | "WELCOME_SEEN"
  | "PUBLIC_SITE_OPENED"
  | "TIP_KNOWN"
  | "TIP_DISMISSED"
  | "TIP_SNOOZED"
  | "FIRST_MATCH_MODE_SELECTED"
  | "MONTHLY_MODEL_SELECTED"
  | "RESOURCE_VIEWED";

export type AdminGuidePedagogicalState = {
  revision: number;
  welcomeSeenAt?: string;
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

export type AdminGuideData = {
  guideVersion: number;
  tenant: { id: string; slug: string; name: string };
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
  | { action: "WELCOME_SEEN" | "PUBLIC_SITE_OPENED"; expectedRevision?: number }
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

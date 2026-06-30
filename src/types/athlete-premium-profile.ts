export type LegendaryStatus = "locked" | "in_progress" | "unlocked";
export type PremiumCardVariant = "official" | "legendary";
export type PremiumShareFormat = "story_9_16";
export type PremiumStatsPeriod = "current" | "all";

export type PremiumAchievementItem = {
  descricao: string;
  ano: number;
  icone: string;
};

export type PremiumLegendaryProgress = {
  season: {
    year: number;
    start: string;
    end: string;
    label: string;
  };
  status: LegendaryStatus;
  isLegendary: boolean;
  progressPercent: number;
  totalScore: number;
  attendance: {
    rachaDays: number;
    presences: number;
    allowedAbsences: 10;
    targetPresences: number;
    rawProgressPercent: number;
    score: number;
    maxScore: 75;
  };
  championOfDay: {
    targetChampionDays: number;
    championDays: number;
    rawProgressPercent: number;
    score: number;
    maxScore: 75;
  };
  rules: {
    attendanceWeight: 50;
    championOfDayWeight: 50;
    allowedAbsences: 10;
    championTargetRatio: 0.25;
    maxScorePerPillar: 75;
    unlockScore: 100;
    minRachaDaysToUnlock: 8;
  };
  nextGoalMessage: string;
};

export type AthletePremiumProfilePayload = {
  tenant: {
    slug: string;
    name: string;
    logoUrl?: string | null;
  };
  athlete: {
    id: string;
    slug: string;
    publicName: string;
    firstName: string;
    nickname: string | null;
    cardName?: string | null;
    avatarUrl: string | null;
    position: string;
    positionLabel: string;
    positionSecondary: string | null;
    positionSecondaryLabel: string | null;
    status: string | null;
    activityStatus?: "active" | "inactive";
    activityStatusLabel?: string;
    mensalista: boolean | null;
    membershipLabel?: string;
  };
  season: {
    year: number;
    start: string;
    end: string;
    label: string;
  };
  stats: {
    games: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    goals: number;
    assists: number;
    titles?: number;
    championOfDay?: number;
    championOfDaySource?: "published" | "derived";
    winRate?: number;
    attendancePercent?: number;
    period?: PremiumStatsPeriod;
    rank?: number | null;
  };
  fut7ProIndex: {
    value: number;
    overall: number;
    confidence: number;
    explanation: string;
  };
  legendaryProgress: PremiumLegendaryProgress;
  visual: {
    cardVariant: PremiumCardVariant;
    medalVariant: PremiumCardVariant;
    medalAsset: string;
    shareFormat: PremiumShareFormat;
    seasonYear?: number;
    seasonLabel?: string;
  };
  achievements?: {
    titulosGrandesTorneios: PremiumAchievementItem[];
    titulosAnuais: PremiumAchievementItem[];
    titulosQuadrimestrais: PremiumAchievementItem[];
    conquistasIndividuaisFut7Pro: PremiumAchievementItem[];
  };
  badges: Array<{
    key: string;
    label: string;
    description: string;
    variant: string;
  }>;
  shareConfig: {
    preferredFormat: PremiumShareFormat;
    formats: PremiumShareFormat[];
  };
  legendaryCelebration?: {
    shouldShow: boolean;
    seasonYear: number;
    title?: string;
    message?: string;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
  };
};

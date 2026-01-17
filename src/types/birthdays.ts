export type BirthdayEntry = {
  id: string;
  name: string;
  nickname?: string | null;
  slug?: string | null;
  photoUrl?: string | null;
  birthDay: number;
  birthMonth: number;
  birthYear?: number | null;
  birthPublic?: boolean | null;
  daysUntil?: number | null;
  ageAtNextBirthday?: number | null;
  nextBirthday?: string | null;
};

export type BirthdaysResponse = {
  slug: string;
  results: BirthdayEntry[];
  total: number;
  month?: number | null;
};

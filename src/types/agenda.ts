export type RachaAgendaItem = {
  id: string;
  weekday: number;
  time: string;
  nextDate?: string | null;
  holiday?: boolean;
  holidayName?: string | null;
};

export type ProximoRachaItem = {
  id: string;
  agendaId: string;
  weekday: number;
  date: string;
  time: string;
  dateTime?: string;
  holiday?: boolean;
  holidayName?: string | null;
};

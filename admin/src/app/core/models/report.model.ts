export interface ReportSession {
  id: string;
  date: string;
}

export interface PlayerAttendanceRow {
  playerId: string;
  playerName: string;
  marksBySessionId: Record<string, string>;
  presentCount: number;
  totalSessions: number;
  rate: number;
}

export interface GroupAttendanceReport {
  groupId: string;
  groupName: string;
  coachName: string;
  sessions: ReportSession[];
  players: PlayerAttendanceRow[];
}

export interface MonthlyAttendanceReport {
  year: number;
  month: number;
  groups: GroupAttendanceReport[];
}

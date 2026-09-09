import { TrainingSession } from './session.model';

export interface AdminDashboard {
  totalPlayers: number;
  activePlayers: number;
  pendingRegistrations: number;
  waitingList: number;
  activeCoaches: number;
  todaysSessionsCount: number;
  upcomingSessionsCount: number;
  unpaidFees: number;
  attendanceRate: number;
  todaysSessions: TrainingSession[];
}

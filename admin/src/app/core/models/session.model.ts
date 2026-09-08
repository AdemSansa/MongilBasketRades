export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface TrainingSession {
  id: string;
  groupId: string;
  groupName: string;
  coachId: string;
  coachName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  status: SessionStatus;
  notes: string | null;
}

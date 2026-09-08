export interface Group {
  id: string;
  name: string;
  seasonId: string;
  ageMin: number;
  ageMax: number;
  capacity: number;
  currentCount: number;
  coachId: string | null;
  coachName: string | null;
  scheduleDay: 'SATURDAY' | 'SUNDAY';
  scheduleStartTime: string;
  scheduleEndTime: string;
  status: 'ACTIVE' | 'INACTIVE';
}

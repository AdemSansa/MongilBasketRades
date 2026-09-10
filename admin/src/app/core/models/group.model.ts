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
  status: 'ACTIVE' | 'INACTIVE';
}

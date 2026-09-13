export interface Coach {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  groupCount: number;
}

export interface CoachGroupSummary {
  id: string;
  name: string;
}

export interface CoachDetail {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  groups: CoachGroupSummary[];
}

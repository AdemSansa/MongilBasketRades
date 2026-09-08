export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_LIST' | 'CANCELLED';

export interface Registration {
  id: string;
  playerId: string;
  playerName: string;
  parentId: string;
  seasonId: string;
  requestedGroupId: string;
  requestedGroupName: string;
  status: RegistrationStatus;
  registrationDate: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  notes: string | null;
}

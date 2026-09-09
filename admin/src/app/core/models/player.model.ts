export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string | null;
  status: string;
  parentId: string;
  currentGroupId: string | null;
}

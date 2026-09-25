export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string | null;
  photoUrl: string | null;
  medicalNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  status: string;
  registrationDate: string;
  parentId: string | null;
  currentGroupId: string | null;
}

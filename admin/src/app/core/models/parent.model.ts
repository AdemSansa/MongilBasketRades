export interface Parent {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  childCount: number;
}

import { Player } from './player.model';

export interface Parent {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  childCount: number;
}

export interface ParentDetail {
  parent: Parent;
  children: Player[];
}

import { PaymentMethod, PaymentStatus } from './payment.model';

export type KitSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type KitOrderStatus = 'ORDERED' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface KitOrder {
  id: string;
  playerId: string;
  playerName: string;
  size: KitSize;
  amount: number;
  status: KitOrderStatus;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
  method: PaymentMethod | null;
  reference: string | null;
  notes: string | null;
  orderedById: string;
  createdAt: string;
}

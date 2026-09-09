export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';

export interface Payment {
  id: string;
  playerId: string;
  playerName: string;
  parentId: string;
  amount: number;
  currency: string;
  period: string;
  paymentDate: string | null;
  method: PaymentMethod | null;
  status: PaymentStatus;
  reference: string | null;
  recordedById: string;
  notes: string | null;
}

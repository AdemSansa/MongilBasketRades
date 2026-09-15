export type PaymentStatus = 'PAID' | 'UNPAID' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';
export type PaymentType = 'MEMBERSHIP' | 'INSURANCE';

export interface Payment {
  id: string;
  playerId: string;
  playerName: string;
  parentId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  period: string;
  paymentDate: string | null;
  method: PaymentMethod | null;
  status: PaymentStatus;
  reference: string | null;
  recordedById: string;
  notes: string | null;
}

export interface PlayerPaymentStatusRow {
  playerId: string;
  playerName: string;
  groupName: string;
  coachName: string;
  status: PaymentStatus | null;
  amount: number | null;
  paymentDate: string | null;
}

export interface MonthlyPaymentStatus {
  year: number;
  month: number;
  period: string;
  rows: PlayerPaymentStatusRow[];
}

export interface RevenueSummary {
  from: string | null;
  to: string | null;
  total: number;
  membershipTotal: number;
  insuranceTotal: number;
  kitTotal: number;
  paymentCount: number;
}

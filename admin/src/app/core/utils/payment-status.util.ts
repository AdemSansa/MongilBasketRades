import { Payment, PaymentStatus } from '../models/payment.model';
import { Season } from '../models/season.model';

export interface SeasonMonth {
  period: string;
  label: string;
}

export interface MonthPaymentStatus extends SeasonMonth {
  status: PaymentStatus | null;
  amount: number | null;
  paymentDate: string | null;
}

export interface InsuranceStatus {
  paid: boolean;
  status: PaymentStatus | null;
  amount: number | null;
  paymentDate: string | null;
}

export interface PlayerPaymentStatus {
  insurance: InsuranceStatus;
  months: MonthPaymentStatus[];
}

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Every "YYYY-MM" month from a season's start date through its end date, inclusive. */
export function enumerateSeasonMonths(season: Season): SeasonMonth[] {
  const start = new Date(season.startDate);
  const end = new Date(season.endDate);
  const months: SeasonMonth[] = [];

  let year = start.getFullYear();
  let month = start.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({
      period: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: `${MONTH_LABELS[month]} ${year}`,
    });
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
}

/** Cross-references a player's full payment list against a season to answer "who paid what". */
export function derivePlayerPaymentStatus(payments: Payment[], season: Season | null): PlayerPaymentStatus {
  const insurancePayment = season
    ? (payments.find((p) => p.type === 'INSURANCE' && p.period === season.name) ?? null)
    : null;

  const membershipByPeriod = new Map(payments.filter((p) => p.type === 'MEMBERSHIP').map((p) => [p.period, p]));

  const months: MonthPaymentStatus[] = season
    ? enumerateSeasonMonths(season).map((m) => {
        const payment = membershipByPeriod.get(m.period);
        return {
          ...m,
          status: payment?.status ?? null,
          amount: payment?.amount ?? null,
          paymentDate: payment?.paymentDate ?? null,
        };
      })
    : [];

  return {
    insurance: {
      paid: insurancePayment?.status === 'PAID',
      status: insurancePayment?.status ?? null,
      amount: insurancePayment?.amount ?? null,
      paymentDate: insurancePayment?.paymentDate ?? null,
    },
    months,
  };
}

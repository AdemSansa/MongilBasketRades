import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Coach } from '../../../core/models/coach.model';
import {
  MonthlyPaymentStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  RevenueSummary,
} from '../../../core/models/payment.model';
import { Player } from '../../../core/models/player.model';
import { Season } from '../../../core/models/season.model';
import { CoachesService } from '../../../core/services/coaches.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { PlayersService } from '../../../core/services/players.service';
import { SeasonsService } from '../../../core/services/seasons.service';
import { SettingsService } from '../../../core/services/settings.service';
import { MonthPaymentStatus, derivePlayerPaymentStatus } from '../../../core/utils/payment-status.util';

const STATUS_FILTERS: { value: PaymentStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PAID', label: 'Paid' },
];

const METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'OTHER'];
const STATUSES: PaymentStatus[] = ['PAID', 'UNPAID', 'OVERDUE'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Tab = 'records' | 'monthly-status' | 'revenue';
type RevenuePreset = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function revenueRangeFor(preset: RevenuePreset): { from: string | null; to: string | null } {
  const now = new Date();
  const today = toDateString(now);

  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'week': {
      const day = (now.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(now);
      monday.setDate(now.getDate() - day);
      return { from: toDateString(monday), to: today };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toDateString(first), to: today };
    }
    case 'year': {
      const first = new Date(now.getFullYear(), 0, 1);
      return { from: toDateString(first), to: today };
    }
    case 'all':
      return { from: null, to: null };
    default:
      return { from: null, to: null };
  }
}

@Component({
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  selector: 'app-payments-list',
  styleUrl: './payments-list.scss',
  templateUrl: './payments-list.html',
})
export class PaymentsList {
  private readonly fb = inject(FormBuilder);
  private readonly paymentsService = inject(PaymentsService);
  private readonly playersService = inject(PlayersService);
  private readonly coachesService = inject(CoachesService);
  private readonly seasonsService = inject(SeasonsService);
  private readonly settingsService = inject(SettingsService);

  readonly statusFilters = STATUS_FILTERS;
  readonly methods = METHODS;
  readonly statuses = STATUSES;
  readonly monthNames = MONTH_NAMES;
  readonly activeFilter = signal<PaymentStatus | null>(null);
  readonly activeTab = signal<Tab>('records');

  readonly payments = signal<Payment[]>([]);
  readonly players = signal<Player[]>([]);
  readonly coaches = signal<Coach[]>([]);
  readonly activeSeason = signal<Season | null>(null);
  readonly membershipFee = signal(50);
  readonly insuranceFee = signal(60);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);

  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);

  // Player combobox for the record-payment form.
  readonly playerQuery = signal('');
  readonly playerDropdownOpen = signal(false);
  readonly selectedPlayer = signal<Player | null>(null);
  readonly selectedPlayerPayments = signal<Payment[]>([]);
  readonly selectedPlayerStatus = computed(() =>
    derivePlayerPaymentStatus(this.selectedPlayerPayments(), this.activeSeason()),
  );
  readonly filteredPlayers = computed(() => {
    const query = this.playerQuery().trim().toLowerCase();
    const all = this.players();
    const matches = query
      ? all.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(query))
      : all;
    return matches.slice(0, 25);
  });

  // Monthly status tab.
  readonly statusYear = signal(new Date().getFullYear());
  readonly statusMonth = signal(new Date().getMonth() + 1);
  readonly statusCoachId = signal<string>('');
  readonly monthlyStatus = signal<MonthlyPaymentStatus | null>(null);
  readonly isLoadingStatus = signal(false);
  readonly paidRows = computed(() => this.monthlyStatus()?.rows.filter((r) => r.status === 'PAID') ?? []);
  readonly unpaidRows = computed(() => this.monthlyStatus()?.rows.filter((r) => r.status !== 'PAID') ?? []);

  // Revenue tab.
  readonly allTimeRevenue = signal<RevenueSummary | null>(null);
  readonly periodRevenue = signal<RevenueSummary | null>(null);
  readonly revenuePreset = signal<RevenuePreset>('month');
  readonly revenueFrom = signal<string>(toDateString(new Date()));
  readonly revenueTo = signal<string>(toDateString(new Date()));
  readonly isLoadingRevenue = signal(false);

  readonly form = this.fb.nonNullable.group({
    playerId: ['', Validators.required],
    type: ['MEMBERSHIP' as PaymentType, Validators.required],
    period: ['', [Validators.required]],
    amount: [50, [Validators.required, Validators.min(0.01)]],
    status: ['UNPAID' as PaymentStatus, Validators.required],
    method: [null as PaymentMethod | null],
    paymentDate: [''],
    reference: [''],
    notes: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    status: ['UNPAID' as PaymentStatus, Validators.required],
    method: [null as PaymentMethod | null],
    paymentDate: [''],
    reference: [''],
    notes: [''],
  });

  constructor() {
    this.load();
    this.loadLookups();
    this.loadAllTimeRevenue();
  }

  private async loadLookups(): Promise<void> {
    try {
      const [players, coaches, seasons, settings] = await Promise.all([
        this.playersService.list(),
        this.coachesService.list(),
        this.seasonsService.list(),
        this.settingsService.get(),
      ]);
      this.players.set(players);
      this.coaches.set(coaches);
      this.activeSeason.set(seasons.find((s) => s.isActive) ?? null);
      this.membershipFee.set(settings.membershipFeeMonthly);
      this.insuranceFee.set(settings.insuranceFeeYearly);
      this.applyTypeDefaults('MEMBERSHIP');
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    }
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.payments.set(await this.paymentsService.list(this.activeFilter()));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'monthly-status' && !this.monthlyStatus()) {
      this.loadMonthlyStatus();
    }
    if (tab === 'revenue' && !this.periodRevenue()) {
      this.setRevenuePreset('month');
    }
  }

  async loadAllTimeRevenue(): Promise<void> {
    try {
      this.allTimeRevenue.set(await this.paymentsService.revenue());
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    }
  }

  setRevenuePreset(preset: RevenuePreset): void {
    this.revenuePreset.set(preset);
    if (preset !== 'custom') {
      const range = revenueRangeFor(preset);
      this.revenueFrom.set(range.from ?? '');
      this.revenueTo.set(range.to ?? '');
    }
    this.loadPeriodRevenue();
  }

  async loadPeriodRevenue(): Promise<void> {
    this.isLoadingRevenue.set(true);
    this.errorMessage.set(null);
    try {
      const from = this.revenuePreset() === 'all' ? null : this.revenueFrom() || null;
      const to = this.revenuePreset() === 'all' ? null : this.revenueTo() || null;
      this.periodRevenue.set(await this.paymentsService.revenue(from, to));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoadingRevenue.set(false);
    }
  }

  async loadMonthlyStatus(): Promise<void> {
    this.isLoadingStatus.set(true);
    this.errorMessage.set(null);
    try {
      this.monthlyStatus.set(
        await this.paymentsService.monthlyStatus(this.statusYear(), this.statusMonth(), this.statusCoachId() || null),
      );
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoadingStatus.set(false);
    }
  }

  setFilter(status: PaymentStatus | null): void {
    this.activeFilter.set(status);
    this.load();
  }

  playerName(playerId: string): string {
    const player = this.players().find((p) => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : playerId;
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  // --- Player combobox ---

  onPlayerQueryInput(value: string): void {
    this.playerQuery.set(value);
    this.playerDropdownOpen.set(true);
    if (this.selectedPlayer() && `${this.selectedPlayer()!.firstName} ${this.selectedPlayer()!.lastName}` !== value) {
      this.selectedPlayer.set(null);
      this.selectedPlayerPayments.set([]);
      this.form.controls.playerId.setValue('');
    }
  }

  openPlayerDropdown(): void {
    this.playerDropdownOpen.set(true);
  }

  closePlayerDropdownDelayed(): void {
    setTimeout(() => this.playerDropdownOpen.set(false), 150);
  }

  async selectPlayer(player: Player): Promise<void> {
    this.selectedPlayer.set(player);
    this.playerQuery.set(`${player.firstName} ${player.lastName}`);
    this.form.controls.playerId.setValue(player.id);
    this.playerDropdownOpen.set(false);

    try {
      this.selectedPlayerPayments.set(await this.paymentsService.list(null, null, player.id));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    }
    this.applyTypeDefaults(this.form.controls.type.value);
  }

  // --- Type-driven defaults ---

  onTypeChange(type: PaymentType): void {
    this.applyTypeDefaults(type);
  }

  selectMonth(month: MonthPaymentStatus): void {
    if (month.status === 'PAID') return;
    this.form.controls.period.setValue(month.period);
  }

  private applyTypeDefaults(type: PaymentType): void {
    if (type === 'MEMBERSHIP') {
      const months = this.selectedPlayerStatus().months;
      const firstUnpaid = months.find((m) => m.status !== 'PAID');
      const now = new Date();
      const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      this.form.controls.period.setValue(firstUnpaid?.period ?? fallback);
      this.form.controls.amount.setValue(this.membershipFee());
    } else {
      this.form.controls.period.setValue(this.activeSeason()?.name ?? '');
      this.form.controls.amount.setValue(this.insuranceFee());
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();
    try {
      await this.paymentsService.create({
        playerId: raw.playerId,
        amount: raw.amount,
        type: raw.type,
        period: raw.period,
        status: raw.status,
        method: raw.method ?? undefined,
        paymentDate: raw.paymentDate || undefined,
        reference: raw.reference || undefined,
        notes: raw.notes || undefined,
      });
      this.form.reset({ type: 'MEMBERSHIP', status: 'UNPAID', amount: this.membershipFee() });
      this.selectedPlayer.set(null);
      this.selectedPlayerPayments.set([]);
      this.playerQuery.set('');
      this.applyTypeDefaults('MEMBERSHIP');
      this.showForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startEdit(payment: Payment): void {
    this.editingId.set(payment.id);
    this.editForm.setValue({
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      paymentDate: payment.paymentDate ?? '',
      reference: payment.reference ?? '',
      notes: payment.notes ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async confirmEdit(payment: Payment): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.actionInFlightId.set(payment.id);
    const raw = this.editForm.getRawValue();
    try {
      await this.paymentsService.update(payment.id, {
        amount: raw.amount,
        status: raw.status,
        method: raw.method ?? undefined,
        paymentDate: raw.paymentDate || undefined,
        reference: raw.reference || undefined,
        notes: raw.notes || undefined,
      });
      this.editingId.set(null);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Group } from '../../../core/models/group.model';
import { Payment, PaymentMethod, PaymentStatus, PaymentType } from '../../../core/models/payment.model';
import { Player } from '../../../core/models/player.model';
import { Season } from '../../../core/models/season.model';
import { GroupsService } from '../../../core/services/groups.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { PlayersService } from '../../../core/services/players.service';
import { SeasonsService } from '../../../core/services/seasons.service';
import { SettingsService } from '../../../core/services/settings.service';
import { MonthPaymentStatus, derivePlayerPaymentStatus } from '../../../core/utils/payment-status.util';

const METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'OTHER'];

interface PendingPayment {
  type: PaymentType;
  period: string;
  label: string;
  defaultAmount: number;
}

@Component({
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  selector: 'app-player-detail',
  styleUrl: './player-detail.scss',
  templateUrl: './player-detail.html',
})
export class PlayerDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly groupsService = inject(GroupsService);
  private readonly seasonsService = inject(SeasonsService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly settingsService = inject(SettingsService);

  readonly methods = METHODS;

  readonly player = signal<Player | null>(null);
  readonly group = signal<Group | null>(null);
  readonly activeSeason = signal<Season | null>(null);
  readonly payments = signal<Payment[]>([]);
  readonly membershipFee = signal(50);
  readonly insuranceFee = signal(60);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly status = computed(() => derivePlayerPaymentStatus(this.payments(), this.activeSeason()));

  readonly pendingPayment = signal<PendingPayment | null>(null);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    status: ['PAID' as PaymentStatus, Validators.required],
    method: ['CASH' as PaymentMethod | null],
    paymentDate: [new Date().toISOString().slice(0, 10)],
    reference: [''],
    notes: [''],
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const [player, groups, seasons, payments, settings] = await Promise.all([
        this.playersService.get(id),
        this.groupsService.list(),
        this.seasonsService.list(),
        this.paymentsService.list(null, null, id),
        this.settingsService.get(),
      ]);
      this.player.set(player);
      this.group.set(groups.find((g) => g.id === player.currentGroupId) ?? null);
      this.activeSeason.set(seasons.find((s) => s.isActive) ?? null);
      this.payments.set(payments);
      this.membershipFee.set(settings.membershipFeeMonthly);
      this.insuranceFee.set(settings.insuranceFeeYearly);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  age(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
      years--;
    }
    return years;
  }

  openInsuranceForm(): void {
    const season = this.activeSeason();
    if (!season) return;
    this.pendingPayment.set({
      type: 'INSURANCE',
      period: season.name,
      label: `Insurance — ${season.name}`,
      defaultAmount: this.insuranceFee(),
    });
    this.form.patchValue({ amount: this.insuranceFee(), status: 'PAID', paymentDate: new Date().toISOString().slice(0, 10) });
  }

  openMonthForm(month: MonthPaymentStatus): void {
    if (month.status === 'PAID') return;
    this.pendingPayment.set({
      type: 'MEMBERSHIP',
      period: month.period,
      label: `Membership — ${month.label}`,
      defaultAmount: this.membershipFee(),
    });
    this.form.patchValue({ amount: this.membershipFee(), status: 'PAID', paymentDate: new Date().toISOString().slice(0, 10) });
  }

  cancelPending(): void {
    this.pendingPayment.set(null);
  }

  async submitPending(): Promise<void> {
    const pending = this.pendingPayment();
    const player = this.player();
    if (!pending || !player || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();
    try {
      await this.paymentsService.create({
        playerId: player.id,
        amount: raw.amount,
        type: pending.type,
        period: pending.period,
        status: raw.status,
        method: raw.method ?? undefined,
        paymentDate: raw.paymentDate || undefined,
        reference: raw.reference || undefined,
        notes: raw.notes || undefined,
      });
      this.pendingPayment.set(null);
      this.payments.set(await this.paymentsService.list(null, null, player.id));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

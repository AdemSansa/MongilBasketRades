import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Payment, PaymentMethod, PaymentStatus } from '../../../core/models/payment.model';
import { Player } from '../../../core/models/player.model';
import { PaymentsService } from '../../../core/services/payments.service';
import { PlayersService } from '../../../core/services/players.service';

const STATUS_FILTERS: { value: PaymentStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
];

const METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'OTHER'];
const STATUSES: PaymentStatus[] = ['PAID', 'PARTIAL', 'UNPAID', 'OVERDUE'];

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-payments-list',
  styleUrl: './payments-list.scss',
  templateUrl: './payments-list.html',
})
export class PaymentsList {
  private readonly fb = inject(FormBuilder);
  private readonly paymentsService = inject(PaymentsService);
  private readonly playersService = inject(PlayersService);

  readonly statusFilters = STATUS_FILTERS;
  readonly methods = METHODS;
  readonly statuses = STATUSES;
  readonly activeFilter = signal<PaymentStatus | null>(null);

  readonly payments = signal<Payment[]>([]);
  readonly players = signal<Player[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);

  /** Payment id currently showing its inline correction form, if any. */
  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    playerId: ['', Validators.required],
    period: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
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
    this.loadPlayers();
  }

  private async loadPlayers(): Promise<void> {
    try {
      this.players.set(await this.playersService.list());
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    }
  }

  setFilter(status: PaymentStatus | null): void {
    this.activeFilter.set(status);
    this.load();
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

  playerName(playerId: string): string {
    const player = this.players().find((p) => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : playerId;
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
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
        period: raw.period,
        status: raw.status,
        method: raw.method ?? undefined,
        paymentDate: raw.paymentDate || undefined,
        reference: raw.reference || undefined,
        notes: raw.notes || undefined,
      });
      this.form.reset({ status: 'UNPAID', amount: 0 });
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

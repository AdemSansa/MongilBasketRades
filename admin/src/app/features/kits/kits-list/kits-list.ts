import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { KitOrder, KitOrderStatus, KitSize } from '../../../core/models/kit-order.model';
import { PaymentMethod, PaymentStatus } from '../../../core/models/payment.model';
import { Player } from '../../../core/models/player.model';
import { KitOrdersService } from '../../../core/services/kit-orders.service';
import { PlayersService } from '../../../core/services/players.service';
import { SettingsService } from '../../../core/services/settings.service';

const SIZES: KitSize[] = ['S', 'M', 'L', 'XL', 'XXL'];
const METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'OTHER'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PAID', 'UNPAID', 'OVERDUE'];

const STATUS_FILTERS: { value: KitOrderStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'ORDERED', label: 'Ordered' },
  { value: 'READY', label: 'Ready' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const NEXT_STATUS: Partial<Record<KitOrderStatus, KitOrderStatus>> = {
  ORDERED: 'READY',
  READY: 'DELIVERED',
};

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-kits-list',
  styleUrl: './kits-list.scss',
  templateUrl: './kits-list.html',
})
export class KitsList {
  private readonly fb = inject(FormBuilder);
  private readonly kitOrdersService = inject(KitOrdersService);
  private readonly playersService = inject(PlayersService);
  private readonly settingsService = inject(SettingsService);

  readonly sizes = SIZES;
  readonly methods = METHODS;
  readonly paymentStatuses = PAYMENT_STATUSES;
  readonly statusFilters = STATUS_FILTERS;
  readonly activeFilter = signal<KitOrderStatus | null>(null);

  readonly orders = signal<KitOrder[]>([]);
  readonly players = signal<Player[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);

  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);

  readonly playerQuery = signal('');
  readonly playerDropdownOpen = signal(false);
  readonly filteredPlayers = computed(() => {
    const query = this.playerQuery().trim().toLowerCase();
    const all = this.players();
    const matches = query
      ? all.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(query))
      : all;
    return matches.slice(0, 25);
  });

  readonly form = this.fb.nonNullable.group({
    playerId: ['', Validators.required],
    size: ['M' as KitSize, Validators.required],
    amount: [50, [Validators.required, Validators.min(0.01)]],
    paymentStatus: ['UNPAID' as PaymentStatus, Validators.required],
    method: [null as PaymentMethod | null],
    paymentDate: [''],
    reference: [''],
    notes: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    size: ['M' as KitSize, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentStatus: ['UNPAID' as PaymentStatus, Validators.required],
    method: [null as PaymentMethod | null],
    paymentDate: [''],
    reference: [''],
    notes: [''],
  });

  constructor() {
    this.load();
    this.loadLookups();
  }

  private async loadLookups(): Promise<void> {
    try {
      const [players, settings] = await Promise.all([this.playersService.list(), this.settingsService.get()]);
      this.players.set(players);
      this.form.controls.amount.setValue(settings.kitFee);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    }
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.orders.set(await this.kitOrdersService.list(this.activeFilter()));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  setFilter(status: KitOrderStatus | null): void {
    this.activeFilter.set(status);
    this.load();
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  onPlayerQueryInput(value: string): void {
    this.playerQuery.set(value);
    this.playerDropdownOpen.set(true);
    this.form.controls.playerId.setValue('');
  }

  openPlayerDropdown(): void {
    this.playerDropdownOpen.set(true);
  }

  closePlayerDropdownDelayed(): void {
    setTimeout(() => this.playerDropdownOpen.set(false), 150);
  }

  selectPlayer(player: Player): void {
    this.playerQuery.set(`${player.firstName} ${player.lastName}`);
    this.form.controls.playerId.setValue(player.id);
    this.playerDropdownOpen.set(false);
  }

  nextStatus(order: KitOrder): KitOrderStatus | null {
    return NEXT_STATUS[order.status] ?? null;
  }

  async advanceStatus(order: KitOrder): Promise<void> {
    const next = this.nextStatus(order);
    if (!next) return;
    await this.setStatus(order, next);
  }

  async cancelOrder(order: KitOrder): Promise<void> {
    await this.setStatus(order, 'CANCELLED');
  }

  private async setStatus(order: KitOrder, status: KitOrderStatus): Promise<void> {
    this.actionInFlightId.set(order.id);
    try {
      await this.kitOrdersService.setStatus(order.id, status);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
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
      await this.kitOrdersService.create({
        playerId: raw.playerId,
        size: raw.size,
        amount: raw.amount,
        paymentStatus: raw.paymentStatus,
        method: raw.method ?? undefined,
        paymentDate: raw.paymentDate || undefined,
        reference: raw.reference || undefined,
        notes: raw.notes || undefined,
      });
      this.form.reset({ size: 'M', paymentStatus: 'UNPAID' });
      this.playerQuery.set('');
      this.showForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startEdit(order: KitOrder): void {
    this.editingId.set(order.id);
    this.editForm.setValue({
      size: order.size,
      amount: order.amount,
      paymentStatus: order.paymentStatus,
      method: order.method,
      paymentDate: order.paymentDate ?? '',
      reference: order.reference ?? '',
      notes: order.notes ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async confirmEdit(order: KitOrder): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.actionInFlightId.set(order.id);
    const raw = this.editForm.getRawValue();
    try {
      await this.kitOrdersService.update(order.id, {
        size: raw.size,
        amount: raw.amount,
        paymentStatus: raw.paymentStatus,
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

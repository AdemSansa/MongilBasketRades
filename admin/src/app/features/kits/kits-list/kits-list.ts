import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PaginationBar } from '../../../core/components/pagination-bar/pagination-bar';
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

const PAYMENT_FILTERS: { value: PaymentStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'UNPAID', label: 'Not paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PAID', label: 'Paid' },
];

const NEXT_STATUS: Partial<Record<KitOrderStatus, KitOrderStatus>> = {
  ORDERED: 'READY',
  READY: 'DELIVERED',
};

@Component({
  imports: [ReactiveFormsModule, DatePipe, PaginationBar],
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
  readonly paymentFilters = PAYMENT_FILTERS;
  readonly activeFilter = signal<KitOrderStatus | null>(null);
  readonly activePaymentFilter = signal<PaymentStatus | null>(null);

  /** Always the full unfiltered set, fetched once -- stats and the filter chips both derive from this instead of round-tripping per click. */
  readonly allOrders = signal<KitOrder[]>([]);
  readonly orders = computed(() => {
    const statusFilter = this.activeFilter();
    const paymentFilter = this.activePaymentFilter();
    return this.allOrders().filter(
      (o) => (!statusFilter || o.status === statusFilter) && (!paymentFilter || o.paymentStatus === paymentFilter),
    );
  });
  readonly page = signal(1);
  readonly pageSize = 25;
  readonly pagedOrders = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.orders().slice(start, start + this.pageSize);
  });
  readonly stats = computed(() => {
    const all = this.allOrders();
    const count = (status: KitOrderStatus) => all.filter((o) => o.status === status).length;
    return {
      total: all.length,
      ordered: count('ORDERED'),
      ready: count('READY'),
      delivered: count('DELIVERED'),
      cancelled: count('CANCELLED'),
      unpaid: all.filter((o) => o.paymentStatus !== 'PAID' && o.status !== 'CANCELLED').length,
      paid: all.filter((o) => o.paymentStatus === 'PAID').length,
    };
  });

  readonly players = signal<Player[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);

  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);
  readonly isBulkActionInFlight = signal(false);

  // Multi-select for bulk status updates.
  readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly allVisibleSelected = computed(() => {
    const visible = this.orders();
    if (visible.length === 0) return false;
    const selected = this.selectedIds();
    return visible.every((o) => selected.has(o.id));
  });

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
      this.allOrders.set(await this.kitOrdersService.list());
      this.selectedIds.set(new Set());
      this.page.set(1);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  setFilter(status: KitOrderStatus | null): void {
    this.activeFilter.set(status);
    this.selectedIds.set(new Set());
    this.page.set(1);
  }

  setPaymentFilter(status: PaymentStatus | null): void {
    this.activePaymentFilter.set(status);
    this.selectedIds.set(new Set());
    this.page.set(1);
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  // --- Multi-select ---

  isSelected(order: KitOrder): boolean {
    return this.selectedIds().has(order.id);
  }

  toggleSelected(order: KitOrder): void {
    const next = new Set(this.selectedIds());
    if (next.has(order.id)) {
      next.delete(order.id);
    } else {
      next.add(order.id);
    }
    this.selectedIds.set(next);
  }

  toggleSelectAllVisible(): void {
    const visible = this.orders();
    if (this.allVisibleSelected()) {
      const next = new Set(this.selectedIds());
      visible.forEach((o) => next.delete(o.id));
      this.selectedIds.set(next);
    } else {
      const next = new Set(this.selectedIds());
      visible.forEach((o) => next.add(o.id));
      this.selectedIds.set(next);
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  async bulkSetStatus(status: KitOrderStatus): Promise<void> {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    this.isBulkActionInFlight.set(true);
    this.errorMessage.set(null);
    try {
      await this.kitOrdersService.setStatusBatch(ids, status);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isBulkActionInFlight.set(false);
    }
  }

  // --- Player combobox ---

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

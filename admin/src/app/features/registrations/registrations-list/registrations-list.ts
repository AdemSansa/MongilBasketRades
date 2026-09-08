import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Registration, RegistrationStatus } from '../../../core/models/registration.model';
import { RegistrationsService } from '../../../core/services/registrations.service';

const STATUS_FILTERS: { value: RegistrationStatus | null; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'WAITING_LIST', label: 'Waiting list' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: null, label: 'All' },
];

@Component({
  imports: [FormsModule, DatePipe],
  selector: 'app-registrations-list',
  styleUrl: './registrations-list.scss',
  templateUrl: './registrations-list.html',
})
export class RegistrationsList {
  private readonly registrationsService = inject(RegistrationsService);

  readonly statusFilters = STATUS_FILTERS;
  readonly activeFilter = signal<RegistrationStatus | null>('PENDING');

  readonly registrations = signal<Registration[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /** Registration id currently showing its reject-reason input, if any. */
  readonly rejectingId = signal<string | null>(null);
  readonly rejectNotes = signal('');
  readonly actionInFlightId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  setFilter(status: RegistrationStatus | null): void {
    this.activeFilter.set(status);
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.registrations.set(await this.registrationsService.list(this.activeFilter()));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  async approve(registration: Registration): Promise<void> {
    this.actionInFlightId.set(registration.id);
    try {
      await this.registrationsService.approve(registration.id);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  startReject(registration: Registration): void {
    this.rejectingId.set(registration.id);
    this.rejectNotes.set('');
  }

  cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectNotes.set('');
  }

  async confirmReject(registration: Registration): Promise<void> {
    const notes = this.rejectNotes().trim();
    if (!notes) return;

    this.actionInFlightId.set(registration.id);
    try {
      await this.registrationsService.reject(registration.id, notes);
      this.rejectingId.set(null);
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

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Coach, CoachDetail } from '../../../core/models/coach.model';
import {
  CoachCreateRequest,
  CoachUpdateRequest,
  CoachesService,
} from '../../../core/services/coaches.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-coaches-list',
  styleUrl: './coaches-list.scss',
  templateUrl: './coaches-list.html',
})
export class CoachesList {
  private readonly fb = inject(FormBuilder);
  private readonly coachesService = inject(CoachesService);

  readonly coaches = signal<Coach[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);
  readonly justRegisteredEmail = signal<string | null>(null);

  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);

  readonly expandedId = signal<string | null>(null);
  readonly expandedDetail = signal<CoachDetail | null>(null);
  readonly isLoadingDetail = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    bio: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    bio: [''],
  });

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.coaches.set(await this.coachesService.list());
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.justRegisteredEmail.set(null);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    try {
      const raw = this.form.getRawValue();
      const request: CoachCreateRequest = {
        email: raw.email,
        firstName: raw.firstName,
        lastName: raw.lastName,
        phone: raw.phone || undefined,
        bio: raw.bio || undefined,
      };
      await this.coachesService.create(request);
      this.justRegisteredEmail.set(raw.email);
      this.form.reset();
      this.showForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startEdit(coach: Coach): void {
    this.editingId.set(coach.id);
    this.editForm.setValue({
      firstName: coach.firstName,
      lastName: coach.lastName,
      phone: coach.phone ?? '',
      bio: coach.bio ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async confirmEdit(coach: Coach): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.actionInFlightId.set(coach.id);
    try {
      const raw = this.editForm.getRawValue();
      const request: CoachUpdateRequest = {
        firstName: raw.firstName,
        lastName: raw.lastName,
        phone: raw.phone || undefined,
        bio: raw.bio || undefined,
      };
      await this.coachesService.update(coach.id, request);
      this.editingId.set(null);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  async toggleStatus(coach: Coach): Promise<void> {
    this.actionInFlightId.set(coach.id);
    try {
      await this.coachesService.setStatus(coach.id, coach.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  async toggleExpand(coach: Coach): Promise<void> {
    if (this.expandedId() === coach.id) {
      this.expandedId.set(null);
      this.expandedDetail.set(null);
      return;
    }

    this.expandedId.set(coach.id);
    this.isLoadingDetail.set(true);
    try {
      this.expandedDetail.set(await this.coachesService.get(coach.id));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoadingDetail.set(false);
    }
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

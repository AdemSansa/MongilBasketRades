import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PaginationBar } from '../../../core/components/pagination-bar/pagination-bar';
import { Parent, ParentDetail } from '../../../core/models/parent.model';
import { ParentsService } from '../../../core/services/parents.service';

@Component({
  imports: [ReactiveFormsModule, FormsModule, PaginationBar, RouterLink],
  selector: 'app-parents-list',
  styleUrl: './parents-list.scss',
  templateUrl: './parents-list.html',
})
export class ParentsList {
  private readonly fb = inject(FormBuilder);
  private readonly parentsService = inject(ParentsService);

  readonly parents = signal<Parent[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly filteredParents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.parents();
    return this.parents().filter((p) =>
      `${p.firstName} ${p.lastName} ${p.email} ${p.phone ?? ''}`.toLowerCase().includes(term),
    );
  });
  readonly page = signal(1);
  readonly pageSize = 25;
  readonly pagedParents = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredParents().slice(start, start + this.pageSize);
  });

  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);
  readonly confirmResetId = signal<string | null>(null);

  readonly expandedId = signal<string | null>(null);
  readonly expandedDetail = signal<ParentDetail | null>(null);
  readonly isLoadingDetail = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    address: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    address: [''],
  });

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.parents.set(await this.parentsService.list());
      this.page.set(1);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.infoMessage.set(null);
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
      await this.parentsService.create({
        email: raw.email,
        firstName: raw.firstName,
        lastName: raw.lastName,
        phone: raw.phone || undefined,
        address: raw.address || undefined,
      });
      this.infoMessage.set(`Parent account created — login details were emailed to ${raw.email}.`);
      this.form.reset();
      this.showForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startEdit(parent: Parent): void {
    this.editingId.set(parent.id);
    this.editForm.setValue({
      firstName: parent.firstName,
      lastName: parent.lastName,
      phone: parent.phone ?? '',
      address: parent.address ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async confirmEdit(parent: Parent): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.actionInFlightId.set(parent.id);
    const raw = this.editForm.getRawValue();
    try {
      await this.parentsService.update(parent.id, {
        firstName: raw.firstName,
        lastName: raw.lastName,
        phone: raw.phone || undefined,
        address: raw.address || undefined,
      });
      this.editingId.set(null);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  async toggleStatus(parent: Parent): Promise<void> {
    this.actionInFlightId.set(parent.id);
    try {
      await this.parentsService.setStatus(parent.id, parent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  askReset(parent: Parent): void {
    this.confirmResetId.set(parent.id);
  }

  cancelReset(): void {
    this.confirmResetId.set(null);
  }

  async confirmReset(parent: Parent): Promise<void> {
    this.actionInFlightId.set(parent.id);
    this.errorMessage.set(null);
    try {
      await this.parentsService.resetPassword(parent.id);
      this.infoMessage.set(`A new temporary password was emailed to ${parent.email}.`);
      this.confirmResetId.set(null);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  async toggleExpand(parent: Parent): Promise<void> {
    if (this.expandedId() === parent.id) {
      this.expandedId.set(null);
      this.expandedDetail.set(null);
      return;
    }

    this.expandedId.set(parent.id);
    this.isLoadingDetail.set(true);
    try {
      this.expandedDetail.set(await this.parentsService.get(parent.id));
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

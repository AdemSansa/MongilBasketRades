import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Coach } from '../../../core/models/coach.model';
import { Group } from '../../../core/models/group.model';
import { Season } from '../../../core/models/season.model';
import { CoachesService } from '../../../core/services/coaches.service';
import { GroupWriteRequest, GroupsService } from '../../../core/services/groups.service';
import { SeasonsService } from '../../../core/services/seasons.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-groups-list',
  styleUrl: './groups-list.scss',
  templateUrl: './groups-list.html',
})
export class GroupsList {
  private readonly fb = inject(FormBuilder);
  private readonly groupsService = inject(GroupsService);
  private readonly seasonsService = inject(SeasonsService);
  private readonly coachesService = inject(CoachesService);

  readonly groups = signal<Group[]>([]);
  readonly seasons = signal<Season[]>([]);
  readonly coaches = signal<Coach[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);

  readonly editingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    seasonId: ['', Validators.required],
    ageMin: [5, [Validators.required, Validators.min(0)]],
    ageMax: [14, [Validators.required, Validators.min(0)]],
    capacity: [20, [Validators.required, Validators.min(1)]],
    coachId: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    seasonId: ['', Validators.required],
    ageMin: [5, [Validators.required, Validators.min(0)]],
    ageMax: [14, [Validators.required, Validators.min(0)]],
    capacity: [20, [Validators.required, Validators.min(1)]],
    coachId: [''],
  });

  constructor() {
    this.load();
    this.loadLookups();
  }

  private async loadLookups(): Promise<void> {
    try {
      const [seasons, coaches] = await Promise.all([this.seasonsService.list(), this.coachesService.list()]);
      this.seasons.set(seasons);
      this.coaches.set(coaches);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    }
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.groups.set(await this.groupsService.list());
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
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
    try {
      await this.groupsService.create(this.toRequest(this.form.getRawValue()));
      this.form.reset({ ageMin: 5, ageMax: 14, capacity: 20 });
      this.showForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  startEdit(group: Group): void {
    this.editingId.set(group.id);
    this.editForm.setValue({
      name: group.name,
      seasonId: group.seasonId,
      ageMin: group.ageMin,
      ageMax: group.ageMax,
      capacity: group.capacity,
      coachId: group.coachId ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async confirmEdit(group: Group): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.actionInFlightId.set(group.id);
    try {
      await this.groupsService.update(group.id, this.toRequest(this.editForm.getRawValue()));
      this.editingId.set(null);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  async toggleStatus(group: Group): Promise<void> {
    this.actionInFlightId.set(group.id);
    try {
      await this.groupsService.setStatus(group.id, group.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  private toRequest(raw: {
    name: string;
    seasonId: string;
    ageMin: number;
    ageMax: number;
    capacity: number;
    coachId: string;
  }): GroupWriteRequest {
    return {
      name: raw.name,
      seasonId: raw.seasonId,
      ageMin: raw.ageMin,
      ageMax: raw.ageMax,
      capacity: raw.capacity,
      coachId: raw.coachId || undefined,
    };
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

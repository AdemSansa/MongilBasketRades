import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Group } from '../../../core/models/group.model';
import { Player } from '../../../core/models/player.model';
import { GroupsService } from '../../../core/services/groups.service';
import { PlayersService } from '../../../core/services/players.service';

const STATUS_FILTERS: { value: string | null; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: null, label: 'All' },
];

@Component({
  imports: [FormsModule, ReactiveFormsModule, DatePipe],
  selector: 'app-players-list',
  styleUrl: './players-list.scss',
  templateUrl: './players-list.html',
})
export class PlayersList {
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly groupsService = inject(GroupsService);

  readonly statusFilters = STATUS_FILTERS;
  readonly activeFilter = signal<string | null>('ACTIVE');
  readonly searchTerm = signal('');

  readonly players = signal<Player[]>([]);
  readonly groups = signal<Group[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly editingId = signal<string | null>(null);
  readonly archivingId = signal<string | null>(null);
  readonly actionInFlightId = signal<string | null>(null);

  readonly editForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: [''],
    medicalNotes: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
  });

  constructor() {
    this.load();
    this.loadGroups();
  }

  private async loadGroups(): Promise<void> {
    try {
      this.groups.set(await this.groupsService.list());
    } catch {
      // Group names are a display nicety here; a failure just falls back to showing raw ids.
    }
  }

  groupName(groupId: string | null): string {
    if (!groupId) return '—';
    return this.groups().find((g) => g.id === groupId)?.name ?? groupId;
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

  setFilter(status: string | null): void {
    this.activeFilter.set(status);
    this.load();
  }

  async search(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.players.set(await this.playersService.list(this.searchTerm().trim() || undefined, this.activeFilter()));
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  startEdit(player: Player): void {
    this.editingId.set(player.id);
    this.editForm.setValue({
      firstName: player.firstName,
      lastName: player.lastName,
      dateOfBirth: player.dateOfBirth,
      gender: player.gender ?? '',
      medicalNotes: player.medicalNotes ?? '',
      emergencyContactName: player.emergencyContactName ?? '',
      emergencyContactPhone: player.emergencyContactPhone ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async confirmEdit(player: Player): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.actionInFlightId.set(player.id);
    const raw = this.editForm.getRawValue();
    try {
      await this.playersService.update(player.id, {
        firstName: raw.firstName,
        lastName: raw.lastName,
        dateOfBirth: raw.dateOfBirth,
        gender: raw.gender || undefined,
        medicalNotes: raw.medicalNotes || undefined,
        emergencyContactName: raw.emergencyContactName || undefined,
        emergencyContactPhone: raw.emergencyContactPhone || undefined,
      });
      this.editingId.set(null);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
    }
  }

  startArchive(player: Player): void {
    this.archivingId.set(player.id);
  }

  cancelArchive(): void {
    this.archivingId.set(null);
  }

  async confirmArchive(player: Player): Promise<void> {
    this.actionInFlightId.set(player.id);
    try {
      await this.playersService.archive(player.id);
      this.archivingId.set(null);
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

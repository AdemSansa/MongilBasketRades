import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PaginationBar } from '../../../core/components/pagination-bar/pagination-bar';
import { Group } from '../../../core/models/group.model';
import { TrainingSession } from '../../../core/models/session.model';
import { GroupsService } from '../../../core/services/groups.service';
import { SessionsService } from '../../../core/services/sessions.service';

@Component({
  imports: [ReactiveFormsModule, DatePipe, PaginationBar],
  selector: 'app-sessions-list',
  styleUrl: './sessions-list.scss',
  templateUrl: './sessions-list.html',
})
export class SessionsList {
  private readonly fb = inject(FormBuilder);
  private readonly sessionsService = inject(SessionsService);
  private readonly groupsService = inject(GroupsService);

  readonly sessions = signal<TrainingSession[]>([]);
  readonly page = signal(1);
  readonly pageSize = 25;
  readonly pagedSessions = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sessions().slice(start, start + this.pageSize);
  });
  readonly groups = signal<Group[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);
  readonly actionInFlightId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    groupId: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    location: [''],
  });

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const [sessions, groups] = await Promise.all([this.sessionsService.list(), this.groupsService.list()]);
      this.sessions.set(sessions);
      this.page.set(1);
      this.groups.set(groups);
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
    const raw = this.form.getRawValue();
    try {
      await this.sessionsService.create({
        groupId: raw.groupId,
        date: raw.date,
        startTime: `${raw.startTime}:00`,
        endTime: `${raw.endTime}:00`,
        location: raw.location || undefined,
      });
      this.form.reset();
      this.showForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async cancelSession(session: TrainingSession): Promise<void> {
    this.actionInFlightId.set(session.id);
    try {
      await this.sessionsService.cancel(session.id);
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

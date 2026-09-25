import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PaginationBar } from '../../../core/components/pagination-bar/pagination-bar';
import { Coach } from '../../../core/models/coach.model';
import { Group } from '../../../core/models/group.model';
import { Player } from '../../../core/models/player.model';
import { Parent } from '../../../core/models/parent.model';
import { CoachesService } from '../../../core/services/coaches.service';
import { ParentsService } from '../../../core/services/parents.service';
import { GroupsService } from '../../../core/services/groups.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { PlayersService } from '../../../core/services/players.service';
import { ReportsService } from '../../../core/services/reports.service';
import { exportMonthlyAttendancePdf, exportPlayersToExcel } from '../../../core/utils/export.util';

const STATUS_FILTERS: { value: string | null; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: null, label: 'All' },
];

const GENDER_FILTERS: { value: string | null; label: string }[] = [
  { value: null, label: 'Any gender' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

type ParentMode = 'NONE' | 'EXISTING' | 'NEW';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  imports: [FormsModule, ReactiveFormsModule, DatePipe, RouterLink, PaginationBar],
  selector: 'app-players-list',
  styleUrl: './players-list.scss',
  templateUrl: './players-list.html',
})
export class PlayersList {
  private readonly fb = inject(FormBuilder);
  private readonly playersService = inject(PlayersService);
  private readonly groupsService = inject(GroupsService);
  private readonly coachesService = inject(CoachesService);
  private readonly reportsService = inject(ReportsService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly parentsService = inject(ParentsService);

  readonly statusFilters = STATUS_FILTERS;
  readonly genderFilters = GENDER_FILTERS;
  readonly months = MONTHS;

  readonly activeFilter = signal<string | null>('ACTIVE');
  readonly genderFilter = signal<string | null>(null);
  readonly coachFilter = signal<string | null>(null);
  readonly searchTerm = signal('');

  readonly players = signal<Player[]>([]);
  readonly page = signal(1);
  readonly pageSize = 25;
  readonly pagedPlayers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.players().slice(start, start + this.pageSize);
  });
  readonly groups = signal<Group[]>([]);
  readonly parents = signal<Parent[]>([]);

  // Walk-in registration: the parent is optional and can be linked later.
  readonly showAddForm = signal(false);
  readonly isAdding = signal(false);
  readonly addedMessage = signal<string | null>(null);
  readonly addForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: [''],
    groupId: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    medicalNotes: [''],
    parentMode: ['NONE' as ParentMode],
    parentId: [''],
    newParentFirstName: [''],
    newParentLastName: [''],
    newParentEmail: [''],
    newParentPhone: [''],
  });

  readonly linkingId = signal<string | null>(null);
  readonly linkForm = this.fb.nonNullable.group({
    parentMode: ['EXISTING' as ParentMode],
    parentId: [''],
    newParentFirstName: [''],
    newParentLastName: [''],
    newParentEmail: [''],
    newParentPhone: [''],
  });
  readonly coaches = signal<Coach[]>([]);
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

  readonly isExportingExcel = signal(false);

  readonly showPdfPanel = signal(false);
  readonly isExportingPdf = signal(false);
  readonly pdfError = signal<string | null>(null);
  readonly pdfCoachId = signal<string>('');
  readonly pdfYear = signal<number>(new Date().getFullYear());
  readonly pdfMonth = signal<number>(new Date().getMonth() + 1);

  constructor() {
    this.load();
    this.loadLookups();
  }

  private async loadLookups(): Promise<void> {
    try {
      const [groups, coaches, parents] = await Promise.all([
        this.groupsService.list(),
        this.coachesService.list(),
        this.parentsService.list(),
      ]);
      this.groups.set(groups);
      this.coaches.set(coaches);
      this.parents.set(parents);
    } catch {
      // Group/coach names are a display nicety here; a failure just falls back to raw ids
      // for the table, and the PDF/coach filter dropdowns simply stay empty.
    }
  }

  groupName(groupId: string | null): string {
    if (!groupId) return '—';
    return this.groups().find((g) => g.id === groupId)?.name ?? groupId;
  }

  parentName(parentId: string | null): string {
    if (!parentId) return 'No parent';
    const parent = this.parents().find((p) => p.id === parentId);
    return parent ? `${parent.firstName} ${parent.lastName}` : '—';
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.addedMessage.set(null);
  }

  /** Resolves the parent choice to a parent id, creating a new parent account (credentials emailed) when asked. */
  private async resolveParentId(
    mode: ParentMode,
    existingId: string,
    fresh: { firstName: string; lastName: string; email: string; phone: string },
  ): Promise<{ parentId?: string; createdEmail?: string }> {
    if (mode === 'EXISTING') return { parentId: existingId || undefined };
    if (mode === 'NEW') {
      if (!fresh.firstName.trim() || !fresh.lastName.trim() || !fresh.email.trim()) {
        throw new Error('New parent needs a first name, last name and email.');
      }
      const created = await this.parentsService.create({
        firstName: fresh.firstName.trim(),
        lastName: fresh.lastName.trim(),
        email: fresh.email.trim(),
        phone: fresh.phone.trim() || undefined,
      });
      this.parents.update((list) => [...list, created]);
      return { parentId: created.id, createdEmail: created.email };
    }
    return {};
  }

  async submitAdd(): Promise<void> {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.isAdding.set(true);
    this.errorMessage.set(null);
    this.addedMessage.set(null);
    const raw = this.addForm.getRawValue();
    try {
      const { parentId, createdEmail } = await this.resolveParentId(raw.parentMode, raw.parentId, {
        firstName: raw.newParentFirstName,
        lastName: raw.newParentLastName,
        email: raw.newParentEmail,
        phone: raw.newParentPhone,
      });
      await this.playersService.create({
        firstName: raw.firstName,
        lastName: raw.lastName,
        dateOfBirth: raw.dateOfBirth,
        gender: raw.gender || undefined,
        groupId: raw.groupId || undefined,
        emergencyContactName: raw.emergencyContactName || undefined,
        emergencyContactPhone: raw.emergencyContactPhone || undefined,
        medicalNotes: raw.medicalNotes || undefined,
        parentId,
      });
      this.addedMessage.set(
        `${raw.firstName} ${raw.lastName} registered.` +
          (createdEmail ? ` Parent login details were emailed to ${createdEmail}.` : ''),
      );
      this.addForm.reset({ parentMode: 'NONE' });
      this.showAddForm.set(false);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isAdding.set(false);
    }
  }

  startLink(player: Player): void {
    this.linkingId.set(player.id);
    this.linkForm.reset({ parentMode: 'EXISTING', parentId: player.parentId ?? '' });
  }

  cancelLink(): void {
    this.linkingId.set(null);
  }

  async confirmLink(player: Player): Promise<void> {
    this.actionInFlightId.set(player.id);
    this.errorMessage.set(null);
    const raw = this.linkForm.getRawValue();
    try {
      const { parentId } = await this.resolveParentId(raw.parentMode, raw.parentId, {
        firstName: raw.newParentFirstName,
        lastName: raw.newParentLastName,
        email: raw.newParentEmail,
        phone: raw.newParentPhone,
      });
      await this.playersService.assignParent(player.id, parentId ?? null);
      this.linkingId.set(null);
      await this.load();
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.actionInFlightId.set(null);
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

  setFilter(status: string | null): void {
    this.activeFilter.set(status);
    this.load();
  }

  setGenderFilter(gender: string | null): void {
    this.genderFilter.set(gender);
    this.load();
  }

  setCoachFilter(coachId: string): void {
    this.coachFilter.set(coachId || null);
    this.load();
  }

  async search(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.players.set(
        await this.playersService.list({
          search: this.searchTerm().trim() || undefined,
          status: this.activeFilter(),
          gender: this.genderFilter(),
          coachId: this.coachFilter(),
        }),
      );
      this.page.set(1);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private async paidThisPeriodResolver(period: string): Promise<(playerId: string) => string> {
    const payments = await this.paymentsService.list(null, period);
    const statusByPlayerId = new Map(payments.map((p) => [p.playerId, p.status]));
    return (playerId) => statusByPlayerId.get(playerId) ?? 'No Record';
  }

  async exportExcel(): Promise<void> {
    this.isExportingExcel.set(true);
    this.errorMessage.set(null);
    try {
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const paidThisMonth = await this.paidThisPeriodResolver(currentPeriod);
      exportPlayersToExcel(this.players(), (groupId) => this.groupName(groupId), paidThisMonth);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isExportingExcel.set(false);
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

  togglePdfPanel(): void {
    this.showPdfPanel.update((v) => !v);
    this.pdfError.set(null);
  }

  async exportPdf(): Promise<void> {
    this.isExportingPdf.set(true);
    this.pdfError.set(null);
    try {
      const coachId = this.pdfCoachId() || null;
      const period = `${this.pdfYear()}-${String(this.pdfMonth()).padStart(2, '0')}`;
      const [report, paidThisMonth] = await Promise.all([
        this.reportsService.monthlyAttendance(this.pdfYear(), this.pdfMonth(), coachId),
        this.paidThisPeriodResolver(period),
      ]);
      const coach = coachId ? this.coaches().find((c) => c.id === coachId) : null;
      const coachLabel = coach ? `${coach.firstName} ${coach.lastName}` : 'All Coaches';
      exportMonthlyAttendancePdf(report, coachLabel, paidThisMonth);
    } catch (error) {
      this.pdfError.set(extractErrorMessage(error));
    } finally {
      this.isExportingPdf.set(false);
    }
  }
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && !('status' in error)) return error.message;
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

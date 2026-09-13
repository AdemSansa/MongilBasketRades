import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SettingsService } from '../../../core/services/settings.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-settings-page',
  styleUrl: './settings-page.scss',
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly savedMessage = signal(false);

  readonly form = this.fb.nonNullable.group({
    membershipFeeMonthly: [50, [Validators.required, Validators.min(0.01)]],
    insuranceFeeYearly: [60, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const settings = await this.settingsService.get();
      this.form.setValue({
        membershipFeeMonthly: settings.membershipFeeMonthly,
        insuranceFeeYearly: settings.insuranceFeeYearly,
      });
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.savedMessage.set(false);
    try {
      await this.settingsService.update(this.form.getRawValue());
      this.savedMessage.set(true);
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

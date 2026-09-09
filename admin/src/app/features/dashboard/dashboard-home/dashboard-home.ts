import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminDashboard } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard-home',
  styleUrl: './dashboard-home.scss',
  templateUrl: './dashboard-home.html',
})
export class DashboardHome {
  private readonly dashboardService = inject(DashboardService);

  readonly dashboard = signal<AdminDashboard | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.dashboard.set(await this.dashboardService.admin());
    } catch (error) {
      this.errorMessage.set(extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; status?: number };
  if (httpError?.error?.message) return httpError.error.message;
  if (httpError?.status === 0) return 'Unable to reach the server. Check your connection.';
  return 'Something went wrong. Please try again.';
}

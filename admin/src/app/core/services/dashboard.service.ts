import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { AdminDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  async admin(): Promise<AdminDashboard> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AdminDashboard>>(`${API_BASE_URL}/dashboard/admin`),
    );
    return response.data;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { AppSettings } from '../models/settings.model';

export interface SettingsUpdateRequest {
  membershipFeeMonthly: number;
  insuranceFeeYearly: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  async get(): Promise<AppSettings> {
    const response = await firstValueFrom(this.http.get<ApiResponse<AppSettings>>(`${API_BASE_URL}/settings`));
    return response.data;
  }

  async update(request: SettingsUpdateRequest): Promise<AppSettings> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AppSettings>>(`${API_BASE_URL}/settings`, request),
    );
    return response.data;
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { MonthlyAttendanceReport } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  async monthlyAttendance(year: number, month: number, coachId?: string | null): Promise<MonthlyAttendanceReport> {
    let params = new HttpParams().set('year', year).set('month', month);
    if (coachId) params = params.set('coachId', coachId);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<MonthlyAttendanceReport>>(`${API_BASE_URL}/reports/monthly-attendance`, {
        params,
      }),
    );
    return response.data;
  }
}

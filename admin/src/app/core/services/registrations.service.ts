import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Registration, RegistrationStatus } from '../models/registration.model';

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  private readonly http = inject(HttpClient);

  async list(status?: RegistrationStatus | null): Promise<Registration[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<Registration[]>>(`${API_BASE_URL}/registrations`, { params }),
    );
    return response.data;
  }

  async approve(id: string): Promise<Registration> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Registration>>(`${API_BASE_URL}/registrations/${id}/approve`, {}),
    );
    return response.data;
  }

  async reject(id: string, notes: string): Promise<Registration> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Registration>>(`${API_BASE_URL}/registrations/${id}/reject`, { notes }),
    );
    return response.data;
  }
}

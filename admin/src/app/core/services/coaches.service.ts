import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Coach, CoachDetail } from '../models/coach.model';

export interface CoachCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
}

export interface CoachUpdateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class CoachesService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Coach[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Coach[]>>(`${API_BASE_URL}/coaches`));
    return response.data;
  }

  async get(id: string): Promise<CoachDetail> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<CoachDetail>>(`${API_BASE_URL}/coaches/${id}`),
    );
    return response.data;
  }

  async create(request: CoachCreateRequest): Promise<CoachDetail> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<CoachDetail>>(`${API_BASE_URL}/coaches`, request),
    );
    return response.data;
  }

  async update(id: string, request: CoachUpdateRequest): Promise<CoachDetail> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<CoachDetail>>(`${API_BASE_URL}/coaches/${id}`, request),
    );
    return response.data;
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<CoachDetail> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<CoachDetail>>(`${API_BASE_URL}/coaches/${id}/status`, { status }),
    );
    return response.data;
  }
}

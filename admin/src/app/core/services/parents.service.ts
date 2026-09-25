import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Parent, ParentDetail } from '../models/parent.model';

export interface CreateParentRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface UpdateParentRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class ParentsService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Parent[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Parent[]>>(`${API_BASE_URL}/parents`));
    return response.data;
  }

  async get(id: string): Promise<ParentDetail> {
    const response = await firstValueFrom(this.http.get<ApiResponse<ParentDetail>>(`${API_BASE_URL}/parents/${id}`));
    return response.data;
  }

  async create(request: CreateParentRequest): Promise<Parent> {
    const response = await firstValueFrom(this.http.post<ApiResponse<Parent>>(`${API_BASE_URL}/parents`, request));
    return response.data;
  }

  async update(id: string, request: UpdateParentRequest): Promise<Parent> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Parent>>(`${API_BASE_URL}/parents/${id}`, request),
    );
    return response.data;
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Parent> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<Parent>>(`${API_BASE_URL}/parents/${id}/status`, { status }),
    );
    return response.data;
  }

  async resetPassword(id: string): Promise<void> {
    await firstValueFrom(this.http.post<ApiResponse<string>>(`${API_BASE_URL}/parents/${id}/reset-password`, {}));
  }
}

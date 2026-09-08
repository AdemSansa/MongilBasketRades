import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { TrainingSession } from '../models/session.model';

export interface CreateSessionRequest {
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly http = inject(HttpClient);

  async list(): Promise<TrainingSession[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<TrainingSession[]>>(`${API_BASE_URL}/sessions`),
    );
    return response.data;
  }

  async create(request: CreateSessionRequest): Promise<TrainingSession> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TrainingSession>>(`${API_BASE_URL}/sessions`, request),
    );
    return response.data;
  }

  async cancel(id: string): Promise<TrainingSession> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<TrainingSession>>(`${API_BASE_URL}/sessions/${id}/cancel`, {}),
    );
    return response.data;
  }
}

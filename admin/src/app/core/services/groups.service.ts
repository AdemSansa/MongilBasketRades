import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Group } from '../models/group.model';

export interface GroupWriteRequest {
  name: string;
  seasonId: string;
  ageMin: number;
  ageMax: number;
  capacity: number;
  coachId?: string;
  scheduleDay: 'SATURDAY' | 'SUNDAY';
  scheduleStartTime: string;
  scheduleEndTime: string;
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Group[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Group[]>>(`${API_BASE_URL}/groups`));
    return response.data;
  }

  async create(request: GroupWriteRequest): Promise<Group> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<Group>>(`${API_BASE_URL}/groups`, request),
    );
    return response.data;
  }

  async update(id: string, request: GroupWriteRequest): Promise<Group> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Group>>(`${API_BASE_URL}/groups/${id}`, request),
    );
    return response.data;
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Group> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Group>>(`${API_BASE_URL}/groups/${id}/status`, { status }),
    );
    return response.data;
  }
}

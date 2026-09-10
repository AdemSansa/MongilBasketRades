import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Player } from '../models/player.model';

export interface UpdatePlayerRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  photoUrl?: string;
  medicalNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PlayerListFilters {
  search?: string;
  status?: string | null;
  gender?: string | null;
  groupId?: string | null;
  coachId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private readonly http = inject(HttpClient);

  async list(filters: PlayerListFilters = {}): Promise<Player[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.gender) params = params.set('gender', filters.gender);
    if (filters.groupId) params = params.set('groupId', filters.groupId);
    if (filters.coachId) params = params.set('coachId', filters.coachId);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<Player[]>>(`${API_BASE_URL}/players`, { params }),
    );
    return response.data;
  }

  async update(id: string, request: UpdatePlayerRequest): Promise<Player> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Player>>(`${API_BASE_URL}/players/${id}`, request),
    );
    return response.data;
  }

  async archive(id: string): Promise<Player> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Player>>(`${API_BASE_URL}/players/${id}/archive`, {}),
    );
    return response.data;
  }
}

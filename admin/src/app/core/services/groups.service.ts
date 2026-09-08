import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Group } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Group[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Group[]>>(`${API_BASE_URL}/groups`));
    return response.data;
  }
}

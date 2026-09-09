import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Season } from '../models/season.model';

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Season[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Season[]>>(`${API_BASE_URL}/seasons`));
    return response.data;
  }
}

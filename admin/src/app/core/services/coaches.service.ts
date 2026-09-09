import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Coach } from '../models/coach.model';

@Injectable({ providedIn: 'root' })
export class CoachesService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Coach[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Coach[]>>(`${API_BASE_URL}/coaches`));
    return response.data;
  }
}

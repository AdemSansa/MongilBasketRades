import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private readonly http = inject(HttpClient);

  async list(): Promise<Player[]> {
    const response = await firstValueFrom(this.http.get<ApiResponse<Player[]>>(`${API_BASE_URL}/players`));
    return response.data;
  }
}

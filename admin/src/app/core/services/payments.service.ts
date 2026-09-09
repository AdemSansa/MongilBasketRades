import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { Payment, PaymentMethod, PaymentStatus } from '../models/payment.model';

export interface CreatePaymentRequest {
  playerId: string;
  amount: number;
  period: string;
  status: PaymentStatus;
  paymentDate?: string;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);

  async list(status?: PaymentStatus | null, period?: string | null): Promise<Payment[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (period) params = params.set('period', period);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<Payment[]>>(`${API_BASE_URL}/payments`, { params }),
    );
    return response.data;
  }

  async create(request: CreatePaymentRequest): Promise<Payment> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<Payment>>(`${API_BASE_URL}/payments`, request),
    );
    return response.data;
  }

  async update(id: string, request: UpdatePaymentRequest): Promise<Payment> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<Payment>>(`${API_BASE_URL}/payments/${id}`, request),
    );
    return response.data;
  }
}

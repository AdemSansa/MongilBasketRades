import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { KitOrder, KitOrderStatus, KitSize } from '../models/kit-order.model';
import { ApiResponse } from '../models/api-response.model';
import { PaymentMethod, PaymentStatus } from '../models/payment.model';

export interface CreateKitOrderRequest {
  playerId: string;
  size: KitSize;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface UpdateKitOrderRequest {
  size: KitSize;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class KitOrdersService {
  private readonly http = inject(HttpClient);

  async list(status?: KitOrderStatus | null, paymentStatus?: PaymentStatus | null): Promise<KitOrder[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<KitOrder[]>>(`${API_BASE_URL}/kit-orders`, { params }),
    );
    return response.data;
  }

  async create(request: CreateKitOrderRequest): Promise<KitOrder> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<KitOrder>>(`${API_BASE_URL}/kit-orders`, request),
    );
    return response.data;
  }

  async update(id: string, request: UpdateKitOrderRequest): Promise<KitOrder> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<KitOrder>>(`${API_BASE_URL}/kit-orders/${id}`, request),
    );
    return response.data;
  }

  async setStatus(id: string, status: KitOrderStatus): Promise<KitOrder> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<KitOrder>>(`${API_BASE_URL}/kit-orders/${id}/status`, { status }),
    );
    return response.data;
  }

  async setStatusBatch(ids: string[], status: KitOrderStatus): Promise<KitOrder[]> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<KitOrder[]>>(`${API_BASE_URL}/kit-orders/status/batch`, { ids, status }),
    );
    return response.data;
  }
}

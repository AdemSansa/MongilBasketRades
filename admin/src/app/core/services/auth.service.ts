import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { ApiResponse } from '../models/api-response.model';
import { AppUser, AuthResponse } from '../models/user.model';

const REFRESH_TOKEN_KEY = 'mbr_admin_refresh_token';

/**
 * Access token lives in memory only (never persisted) — lost on page
 * refresh by design, recovered via tryRestoreSession() using the refresh
 * token. Refresh token lives in sessionStorage (cleared when the tab
 * closes), not localStorage, to limit the window an XSS payload could
 * exfiltrate a long-lived credential. This is a pragmatic browser-context
 * equivalent of the Flutter app's flutter_secure_storage — not as strong
 * as an httpOnly cookie, which would need backend support to issue one.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private accessTokenValue: string | null = null;
  private readonly currentUserSignal = signal<AppUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  get accessToken(): string | null {
    return this.accessTokenValue;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/login`, { email, password }),
    );
    this.applyAuthResponse(response.data);
  }

  /** Called once at app startup to recover a session after a page reload. */
  async tryRestoreSession(): Promise<void> {
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return;

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/refresh`, { refreshToken }),
      );
      this.applyAuthResponse(response.data);
    } catch {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  logout(): void {
    this.accessTokenValue = null;
    this.currentUserSignal.set(null);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    this.router.navigateByUrl('/login');
  }

  private applyAuthResponse(auth: AuthResponse): void {
    this.accessTokenValue = auth.accessToken;
    this.currentUserSignal.set(auth.user);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  }
}

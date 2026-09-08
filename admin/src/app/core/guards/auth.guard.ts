import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Client-side UX gate only — the backend enforces ADMIN-only access on every request regardless (PROJECT_SCOPE.md §26/§30). */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.currentUser()?.role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/login']);
};

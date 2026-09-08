import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-shell/dashboard-shell').then((m) => m.DashboardShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/dashboard-home/dashboard-home').then((m) => m.DashboardHome),
      },
      {
        path: 'registrations',
        loadComponent: () =>
          import('./features/registrations/registrations-list/registrations-list').then(
            (m) => m.RegistrationsList,
          ),
      },
      {
        path: 'players',
        loadComponent: () =>
          import('./features/players/players-placeholder/players-placeholder').then(
            (m) => m.PlayersPlaceholder,
          ),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/groups/groups-placeholder/groups-placeholder').then(
            (m) => m.GroupsPlaceholder,
          ),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/sessions-list/sessions-list').then((m) => m.SessionsList),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

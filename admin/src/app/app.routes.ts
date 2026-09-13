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
          import('./features/players/players-list/players-list').then((m) => m.PlayersList),
      },
      {
        path: 'players/:id',
        loadComponent: () =>
          import('./features/players/player-detail/player-detail').then((m) => m.PlayerDetail),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/groups/groups-list/groups-list').then((m) => m.GroupsList),
      },
      {
        path: 'coaches',
        loadComponent: () =>
          import('./features/coaches/coaches-list/coaches-list').then((m) => m.CoachesList),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/sessions-list/sessions-list').then((m) => m.SessionsList),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payments-list/payments-list').then((m) => m.PaymentsList),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings-page/settings-page').then((m) => m.SettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

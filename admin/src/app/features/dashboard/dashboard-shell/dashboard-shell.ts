import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-dashboard-shell',
  styleUrl: './dashboard-shell.scss',
  templateUrl: './dashboard-shell.html',
})
export class DashboardShell {
  readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}

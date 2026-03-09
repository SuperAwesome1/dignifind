import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <!-- Main top bar -->
    <nav class="df-navbar" role="navigation" aria-label="Main navigation">
      <!-- Brand -->
      <a class="df-brand" routerLink="/funerals" aria-label="DigniFind Home">
        <img src="logo.png" alt="DigniFind Logo" class="df-logo" />
      </a>

      <!-- Desktop nav links -->
      <ul class="df-nav-links" role="list">
        <li><a routerLink="/funerals"      routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Register</a></li>
        <li><a routerLink="/funerals/new"  routerLinkActive="active">Add Funeral</a></li>
        <li><a routerLink="/profile"       routerLinkActive="active">Profile</a></li>
        <li><a routerLink="/search"        routerLinkActive="active">Search</a></li>
      </ul>

      <div class="df-spacer"></div>

      <!-- Theme toggle -->
      <button class="df-theme-btn" (click)="themeService.toggle()"
              [attr.aria-label]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              title="{{ themeService.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}">
        @if (themeService.theme() === 'dark') {
          <!-- Sun icon -->
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path stroke-linecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        } @else {
          <!-- Moon icon -->
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        }
      </button>

      <!-- User email (desktop) -->
      @if (authService.user$ | async; as user) {
        <span class="df-user" title="{{ user.email }}">{{ user.email }}</span>
        <button class="df-logout-btn" (click)="logout()" aria-label="Logout">
          Logout
        </button>
      }

      <!-- Hamburger (mobile) -->
      <button class="df-hamburger" (click)="mobileOpen.set(!mobileOpen())"
              [attr.aria-expanded]="mobileOpen()" aria-label="Toggle mobile menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <!-- Mobile drawer -->
    <div class="df-mobile-nav" [class.open]="mobileOpen()">
      <a routerLink="/funerals"      routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"
         (click)="mobileOpen.set(false)">Register</a>
      <a routerLink="/funerals/new"  routerLinkActive="active" (click)="mobileOpen.set(false)">Add Funeral</a>
      <a routerLink="/profile"        routerLinkActive="active" (click)="mobileOpen.set(false)">Profile</a>
      <a routerLink="/search"        routerLinkActive="active" (click)="mobileOpen.set(false)">Search</a>

      @if (authService.user$ | async; as user) {
        <div class="df-mobile-divider"></div>
        <span style="font-size:.8rem;color:var(--text-muted);padding:.3rem .75rem">{{ user.email }}</span>
        <a role="button" (click)="logout(); mobileOpen.set(false)"
           style="cursor:pointer;color:var(--accent-light)">Logout</a>
      }
    </div>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);
  mobileOpen = signal(false);

  logout(): void {
    this.authService.signOut().then(() => this.router.navigate(['/login']));
  }
}

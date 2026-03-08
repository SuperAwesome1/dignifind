import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileData } from '../../models/profile.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav id="mainNav" class="navbar">
      <div class="navbar-inner">
        @if (profile?.logoUrl) {
          <a href="/" style="display:block;width:100%;">
            <img [src]="profile!.logoUrl" alt="Provider Logo" class="navbar-logo" />
          </a>
        } @else {
          <a href="/" class="navbar-text-logo">
            <span class="logo-dignify">Digni</span><span class="logo-find">find</span>
          </a>
        }
      </div>
    </nav>
  `,
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() profile: ProfileData | null = null;
}

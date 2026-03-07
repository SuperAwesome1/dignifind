import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;
                background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(91,108,255,.15),transparent) var(--bg-base)">
      <div style="text-align:center">
        <p style="font-size:7rem;font-weight:800;line-height:1;
                  background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 100%);
                  -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0">404</p>
        <h1 style="font-size:1.5rem;margin:.75rem 0 .5rem">Page not found</h1>
        <p style="color:var(--text-muted);margin-bottom:2rem">The page you're looking for doesn't exist or has been moved.</p>
        <a class="df-btn df-btn-primary" routerLink="/funerals">Go to Dashboard</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent { }

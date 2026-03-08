import { Component, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-inform-others',
    standalone: true,
    template: `
    <section class="inform-section">
      <div class="container">
        <div class="row">
          <div class="col text-center">
            <h1 class="inform-heading">Inform Others</h1>
            <div class="share-buttons">
              <a class="share-btn whatsapp" href="https://api.whatsapp.com/send?text={{ shareText }}" target="_blank" rel="noopener">
                <span class="share-icon">💬</span> WhatsApp
              </a>
              <a class="share-btn facebook" [href]="facebookShareUrl" target="_blank" rel="noopener">
                <span class="share-icon">📘</span> Facebook
              </a>
              <a class="share-btn twitter" [href]="twitterShareUrl" target="_blank" rel="noopener">
                <span class="share-icon">🐦</span> Twitter / X
              </a>
              <a class="share-btn email" [href]="emailShareUrl">
                <span class="share-icon">✉️</span> Email
              </a>
            </div>
          </div>
        </div>
      </div>
      <hr class="brand-hr" />
    </section>
  `,
    styles: [`
    .inform-section { background: rgba(255,255,255,0.85); padding: 40px 0 20px; }
    .inform-heading { color: #27345C; font-family: 'Times New Roman', Times, serif; margin-bottom: 24px; }
    .share-buttons { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .share-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: transform 0.2s, box-shadow 0.2s; color: white; }
    .share-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .whatsapp { background: #25D366; }
    .facebook { background: #1877F2; }
    .twitter { background: #1DA1F2; }
    .email { background: #C49847; }
    .brand-hr { border-color: #C49847; border-width: 3px; max-width: 90px; margin: 30px auto 0; }
  `]
})
export class InformOthersComponent {
    get shareText(): string {
        return encodeURIComponent(`Please click on the following link: ${window.location.href}`);
    }
    get facebookShareUrl(): string {
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    }
    get twitterShareUrl(): string {
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`;
    }
    get emailShareUrl(): string {
        return `mailto:?subject=Service%20Programme&body=Please%20find%20the%20service%20programme%20here%3A%20${encodeURIComponent(window.location.href)}`;
    }
}

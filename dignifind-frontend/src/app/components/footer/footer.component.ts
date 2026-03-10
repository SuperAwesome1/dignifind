import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileData } from '../../models/profile.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="site-footer" [style.background-color]="footerBg" [style.color]="footerColor">
      <div class="container">
        <div class="footer-grid">

          <!-- Contact Number -->
          @if (phone) {
            <div class="footer-item text-center">
              <a [href]="'tel:' + phone" class="footer-icon-link" aria-label="Call us" [style.color]="footerColor">
                <i class="bi bi-telephone-fill footer-icon"></i>
              </a>
              <p class="footer-contact"><a [href]="'tel:' + phone" [style.color]="footerColor">{{ phone }}</a></p>
            </div>
          }

          <!-- Emergency Number -->
          @if (emergency) {
            <div class="footer-item text-center">
              <h3 class="emergency-label" [style.color]="footerColor"><strong>24hr/Emergency</strong></h3>
              <p class="footer-contact"><a [href]="'tel:' + emergency" [style.color]="footerColor">{{ emergency }}</a></p>
            </div>
          }

          <!-- WhatsApp -->
          @if (whatsapp) {
            <div class="footer-item text-center">
              <a [href]="whatsappUrl" class="footer-icon-link" target="_blank" rel="noopener" aria-label="WhatsApp" [style.color]="footerColor">
                <i class="bi bi-whatsapp footer-icon"></i>
              </a>
              <p class="footer-contact"><a [href]="whatsappUrl" target="_blank" rel="noopener" [style.color]="footerColor">{{ whatsapp }}</a></p>
            </div>
          }

          <!-- Email -->
          @if (email) {
            <div class="footer-item text-center">
              <a [href]="'mailto:' + email" class="footer-icon-link" aria-label="Email us" [style.color]="footerColor">
                <i class="bi bi-envelope-fill footer-icon"></i>
              </a>
              <p class="footer-contact"><a [href]="'mailto:' + email" [style.color]="footerColor">{{ email }}</a></p>
            </div>
          }

          <!-- Location (New) -->
          @if (locationName) {
            <div class="footer-item text-center">
              <a [href]="locationUrl" target="_blank" rel="noopener" class="footer-icon-link" aria-label="Location" [style.color]="footerColor">
                <i class="bi bi-geo-alt-fill footer-icon"></i>
              </a>
              <p class="footer-contact"><a [href]="locationUrl" target="_blank" rel="noopener" [style.color]="footerColor">{{ locationName }}</a></p>
            </div>
          }

          <!-- Social Pages -->
          @if (hasSocials) {
            <div class="footer-item text-center">
              <div class="social-icons">
                @if (profile?.socialPages?.facebook) {
                  <a [href]="profile!.socialPages!.facebook" target="_blank" rel="noopener" class="footer-icon-link" aria-label="Facebook" [style.color]="footerColor">
                    <i class="bi bi-facebook footer-icon"></i>
                  </a>
                }
                @if (profile?.socialPages?.instagram) {
                  <a [href]="profile!.socialPages!.instagram" target="_blank" rel="noopener" class="footer-icon-link" aria-label="Instagram" [style.color]="footerColor">
                    <i class="bi bi-instagram footer-icon"></i>
                  </a>
                }
                @if (profile?.socialPages?.twitter) {
                  <a [href]="profile!.socialPages!.twitter" target="_blank" rel="noopener" class="footer-icon-link" aria-label="Twitter" [style.color]="footerColor">
                    <i class="bi bi-twitter-x footer-icon"></i>
                  </a>
                }
                @if (profile?.socialPages?.linkedin) {
                  <a [href]="profile!.socialPages!.linkedin" target="_blank" rel="noopener" class="footer-icon-link" aria-label="LinkedIn" [style.color]="footerColor">
                    <i class="bi bi-linkedin footer-icon"></i>
                  </a>
                }
                @if (profile?.socialPages?.youtube) {
                  <a [href]="profile!.socialPages!.youtube" target="_blank" rel="noopener" class="footer-icon-link" aria-label="YouTube" [style.color]="footerColor">
                    <i class="bi bi-youtube footer-icon"></i>
                  </a>
                }
              </div>
            </div>
          }

        </div>

        <div class="powered-by text-center" style="border-top-color: rgba(255,255,255,0.2)">
          <p [style.color]="footerColor" style="opacity: 0.8">Powered by <a href="https://dignifind.co.za" target="_blank" rel="noopener" [style.color]="footerColor">www.dignifind.co.za</a></p>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input() profile: ProfileData | null = null;

  get phone(): string { return this.profile?.contactNumber ?? ''; }
  get emergency(): string { return this.profile?.emergencyNumber ?? ''; }
  get whatsapp(): string { return this.profile?.whatsappNumber ?? ''; }
  get email(): string { return this.profile?.email ?? ''; }

  get locationName(): string { return this.profile?.location?.name ?? ''; }
  get locationUrl(): string { return this.profile?.location?.url ?? ''; }

  get footerBg(): string { return this.profile?.footerSettings?.backgroundColor ?? '#C59842'; }
  get footerColor(): string { return this.profile?.footerSettings?.fontColor ?? '#ffffff'; }

  get whatsappUrl(): string {
    const n = this.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${n}`;
  }
  get hasSocials(): boolean {
    const s = this.profile?.socialPages;
    return !!(s?.facebook || s?.instagram || s?.twitter || s?.linkedin || s?.youtube);
  }
}

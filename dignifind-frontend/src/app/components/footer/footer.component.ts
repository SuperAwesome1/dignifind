import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    standalone: true,
    template: `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-item text-center">
            <a href="tel:0615240262" class="footer-icon-link" aria-label="Call us">
              <span class="footer-icon">📞</span>
            </a>
            <p class="footer-contact"><a href="tel:0615240262">0615240262</a></p>
          </div>

          <div class="footer-item text-center">
            <h3 class="emergency-label"><strong>24hr/Emergency</strong></h3>
            <p class="footer-contact"><a href="tel:0615838449">0615838449</a></p>
          </div>

          <div class="footer-item text-center">
            <a href="https://wa.me/0826576797" class="footer-icon-link" target="_blank" rel="noopener" aria-label="WhatsApp">
              <span class="footer-icon">💬</span>
            </a>
            <p class="footer-contact"><a href="https://wa.me/0826576797" target="_blank" rel="noopener">0826576797</a></p>
          </div>

          <div class="footer-item text-center">
            <a href="mailto:thalimash@yahoo.com" class="footer-icon-link" aria-label="Email us">
              <span class="footer-icon">✉️</span>
            </a>
            <p class="footer-contact"><a href="mailto:thalimash@yahoo.com">thalimash&#64;yahoo.com</a></p>
          </div>

          <div class="footer-item text-center">
            <a href="https://www.google.com/maps/place/Mashigo's+Funeral+Services/@-25.3931444,28.1587022" target="_blank" rel="noopener" class="footer-icon-link" aria-label="Head Office">
              <span class="footer-icon">📍</span>
            </a>
            <p class="footer-contact">Head Office</p>
          </div>
        </div>

        <div class="powered-by text-center">
          <p>Powered by <a href="http://dignifind.co.za" target="_blank" rel="noopener">www.dignifind.co.za</a></p>
        </div>
      </div>
    </footer>
  `,
    styleUrl: './footer.component.scss'
})
export class FooterComponent { }

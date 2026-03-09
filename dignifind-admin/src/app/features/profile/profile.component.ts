import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ProfileService, ProfileData, SocialPages, TypographyStyle, DEFAULT_TYPOGRAPHY, FONT_OPTIONS } from '../../core/services/profile.service';
import { StorageService, UploadEvent } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { filter, take } from 'rxjs/operators';

interface ImageSlot {
  key: 'background' | 'logo' | 'header';
  label: string;
  hint: string;
  icon: string;
  url: string;
  progress: number;
  uploading: boolean;
}

const TYPOGRAPHY_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'hr'] as const;
type TypoTag = typeof TYPOGRAPHY_TAGS[number];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  styles: [`
        .profile-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width:900px) { .profile-grid { grid-template-columns: 1fr 1fr; } }

        .img-slot {
            border: 2px dashed var(--border);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            text-align: center;
            cursor: pointer;
            transition: border-color .2s, background .2s;
            position: relative;
            overflow: hidden;
            min-height: 140px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: .5rem;
            &:hover { border-color: var(--primary); background: rgba(91,108,255,.04); }
        }
        .img-slot.is-portrait {
            aspect-ratio: 3 / 4;
            width: auto;
            max-width: 240px;
            min-height: 200px;
        }
        .img-slot-preview {
            position: absolute; inset: 0;
            background-size: cover; background-position: center;
            border-radius: calc(var(--radius-lg) - 2px);
            display: flex; align-items: flex-end; justify-content: flex-end; padding: .5rem;
        }
        .img-slot input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .img-change-badge {
            background: rgba(0,0,0,.55); color: #fff; font-size: .7rem;
            padding: .2rem .6rem; border-radius: 999px;
        }
        .progress-bar-wrap {
            position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: var(--border);
        }
        .progress-bar-fill {
            height: 100%; background: var(--primary);
            transition: width .2s; border-radius: 0 2px 2px 0;
        }

        .df-select-sm, .color-input-wrap {
            display: inline-flex; align-items: center; gap: .4rem;
        }
        .df-select-sm select {
            background: var(--bg-elevated); border: 1px solid var(--border);
            border-radius: var(--radius-sm); color: var(--text-primary);
            padding: .35rem .65rem; font-size: .82rem; font-family: var(--font);
            outline: none; cursor: pointer;
            &:focus { border-color: var(--primary); }
        }
        .color-swatch {
            width: 28px; height: 28px; border-radius: 6px; border: 2px solid var(--border);
            cursor: pointer; overflow: hidden; position: relative; flex-shrink: 0;
        }
        .color-swatch input[type="color"] {
            position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px);
            opacity: 0; cursor: pointer; border: none; padding: 0;
        }
        .tag-label {
            font-size: .9rem; font-weight: 600; font-family: var(--font);
            color: var(--text-primary); width: 24px; display: inline-block;
        }
        .preview-box {
            background: var(--bg-elevated); border: 1px solid var(--border);
            border-radius: var(--radius); padding: 1.25rem 1.5rem;
        }
        .df-input-group {
            display: flex;
            flex-direction: column;
            gap: .35rem;
        }
        .df-input-group label {
            font-size: .78rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--text-muted);
        }
        .df-input-group input {
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            padding: .45rem .75rem;
            font-size: .88rem;
            font-family: var(--font);
            outline: none;
            width: 100%;
            box-sizing: border-box;
            transition: border-color .15s;
            &:focus { border-color: var(--primary); }
        }
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        @media(min-width:640px) { .contact-grid { grid-template-columns: 1fr 1fr; } }
        .social-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-top: 1rem;
        }
        @media(min-width:640px) { .social-grid { grid-template-columns: 1fr 1fr; } }
        .social-icon { font-size: 1.1rem; vertical-align: middle; margin-right: .35rem; }
    `],
  template: `
    <app-navbar></app-navbar>
 
    <main class="df-page">
      <div class="df-page-header">
        <div>
          <h1>Profile Settings</h1>
          <p style="margin:0;font-size:.85rem;color:var(--text-muted)">Customise your brand images, fonts and colours</p>
        </div>
      </div>
 
      @if (loading()) {
        <div class="df-spinner"></div>
      } @else {
 
        <!-- ── Portal Link ──────────────────────────────────── -->
        <div class="df-card" style="margin-bottom:1.5rem">
          <p class="section-label">Portal Link</p>
          <div class="df-input-group">
            <label>Public Profile URL Handle</label>
            <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-elevated); border: 1px solid var(--border); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);">
                <span style="color: var(--text-muted); font-size: 0.85rem; white-space: nowrap;">dignifind.com/</span>
                <input type="text" [(ngModel)]="slug" (ngModelChange)="markDirty()" placeholder="your-business-name" 
                       style="border: none; background: transparent; padding: 0; font-weight: 600;" />
            </div>
            <p style="font-size: .7rem; color: var(--text-muted); margin-top: 0.35rem;">
                This creates a cleaner link for customers: <strong>dignifind.com/{{ slug || 'your-business' }}/...</strong>
            </p>
          </div>
        </div>

        <!-- ── Images ─────────────────────────────────────── -->
        <div class="df-card" style="margin-bottom:1.5rem">
          <p class="section-label">Brand Images</p>
          <div class="profile-grid">
            @for (slot of imageSlots; track slot.key) {
              <div>
                <p style="font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:.5rem">
                  {{ slot.label }}
                  <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-muted)"> — {{ slot.hint }}</span>
                </p>
                <div class="img-slot" [class.is-portrait]="slot.key === 'background'" (click)="triggerFileInput(slot.key)">
                  <!-- Preview -->
                  @if (slot.url) {
                    <div class="img-slot-preview" style="background: #f8f9fa;">
                      <img [src]="slot.url" alt="Preview Image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; border-radius: inherit; z-index: 1;" />
                      <span class="img-change-badge" style="position: relative; z-index: 2;">Change</span>
                    </div>
                  } @else {
                    <!-- Placeholder icon -->
                    <div style="font-size:2rem;color:var(--text-muted)">{{ slot.icon }}</div>
                    <span style="font-size:.8rem;color:var(--text-muted)">Click to upload</span>
                    <span style="font-size:.72rem;color:var(--text-muted)">PNG, JPG, WebP</span>
                  }
                  <!-- Hidden file input -->
                  <input [id]="'file-' + slot.key" type="file" accept="image/*"
                         (change)="onFileChange($event, slot)" />
                  <!-- Progress -->
                  @if (slot.uploading) {
                    <div class="progress-bar-wrap">
                      <div class="progress-bar-fill" [style.width]="slot.progress + '%'"></div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Footer & Contact ─────────────────────────── -->
        <div class="df-card" style="margin-bottom:1.5rem">
          <p class="section-label">Footer Settings</p>
          
          <div style="display:grid; grid-template-columns:1fr; gap:1.5rem; margin-bottom:1.5rem;">
            <!-- Colors -->
            <div style="display:flex; gap:2rem; flex-wrap:wrap;">
              <div class="color-input-wrap">
                <label style="font-size:.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Background Colour</label>
                <div style="display:flex; align-items:center; gap:0.5rem">
                  <div class="color-swatch" [style.background]="footerSettings.backgroundColor">
                    <input type="color" [(ngModel)]="footerSettings.backgroundColor" (ngModelChange)="markDirty()" />
                  </div>
                  <span style="font-size:.8rem;color:var(--text-secondary)">{{ footerSettings.backgroundColor }}</span>
                </div>
              </div>
              <div class="color-input-wrap">
                <label style="font-size:.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Font Colour</label>
                <div style="display:flex; align-items:center; gap:0.5rem">
                  <div class="color-swatch" [style.background]="footerSettings.fontColor">
                    <input type="color" [(ngModel)]="footerSettings.fontColor" (ngModelChange)="markDirty()" />
                  </div>
                  <span style="font-size:.8rem;color:var(--text-secondary)">{{ footerSettings.fontColor }}</span>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="contact-grid">
              <div class="df-input-group">
                <label>📍 Business / Location Name</label>
                <input type="text" [(ngModel)]="location.name" (ngModelChange)="markDirty()" placeholder="e.g. Pretoria North Branch" />
              </div>
              <div class="df-input-group">
                <label>🗺️ Google Maps URL</label>
                <input type="url" [(ngModel)]="location.url" (ngModelChange)="markDirty()" placeholder="https://goo.gl/maps/..." />
              </div>
            </div>
          </div>

          <p style="font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:.75rem">Contact Details</p>
          <div class="contact-grid">
            <div class="df-input-group">
              <label>📞 Contact Number</label>
              <input type="tel" [(ngModel)]="contact.contactNumber" (ngModelChange)="markDirty()" placeholder="e.g. +27 11 000 0000" />
            </div>
            <div class="df-input-group">
              <label>🚨 Emergency Number</label>
              <input type="tel" [(ngModel)]="contact.emergencyNumber" (ngModelChange)="markDirty()" placeholder="e.g. +27 82 000 0000" />
            </div>
            <div class="df-input-group">
              <label>💬 WhatsApp Number</label>
              <input type="tel" [(ngModel)]="contact.whatsappNumber" (ngModelChange)="markDirty()" placeholder="e.g. +27 82 000 0000" />
            </div>
            <div class="df-input-group">
              <label>✉️ Email Address</label>
              <input type="email" [(ngModel)]="contact.email" (ngModelChange)="markDirty()" placeholder="info@example.com" />
            </div>
          </div>

          <p style="font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin:1.25rem 0 .5rem">Social Pages</p>
          <div class="social-grid">
            <div class="df-input-group">
              <label><span class="social-icon">📘</span>Facebook</label>
              <input type="url" [(ngModel)]="social.facebook" (ngModelChange)="markDirty()" placeholder="https://facebook.com/yourpage" />
            </div>
            <div class="df-input-group">
              <label><span class="social-icon">📸</span>Instagram</label>
              <input type="url" [(ngModel)]="social.instagram" (ngModelChange)="markDirty()" placeholder="https://instagram.com/yourpage" />
            </div>
            <div class="df-input-group">
              <label><span class="social-icon">🐦</span>Twitter / X</label>
              <input type="url" [(ngModel)]="social.twitter" (ngModelChange)="markDirty()" placeholder="https://x.com/yourpage" />
            </div>
            <div class="df-input-group">
              <label><span class="social-icon">💼</span>LinkedIn</label>
              <input type="url" [(ngModel)]="social.linkedin" (ngModelChange)="markDirty()" placeholder="https://linkedin.com/company/yourpage" />
            </div>
            <div class="df-input-group">
              <label><span class="social-icon">▶️</span>YouTube</label>
              <input type="url" [(ngModel)]="social.youtube" (ngModelChange)="markDirty()" placeholder="https://youtube.com/@yourchannel" />
            </div>
          </div>
        </div>

        <!-- ── Typography ─────────────────────────────────── -->
        <div class="df-card" style="margin-bottom:5rem">
          <p class="section-label">Typography Styles</p>
          <div class="df-table-wrap" style="margin-bottom:1.5rem">
            <table class="df-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Font family</th>
                  <th>Colour</th>
                </tr>
              </thead>
              <tbody>
                @for (tag of typoTags; track tag) {
                  <tr>
                    <td data-label="Tag"><span class="tag-label">{{ tag }}</span></td>
                    <td data-label="Font family">
                      @if (tag !== 'hr') {
                        <div class="df-select-sm">
                          <select [(ngModel)]="typo[tag]['fontFamily']" (ngModelChange)="markDirty()">
                            @for (f of fonts; track f) {
                              <option [value]="f">{{ f }}</option>
                            }
                          </select>
                        </div>
                      } @else {
                        <span style="color:var(--text-muted);font-size:.8rem">—</span>
                      }
                    </td>
                    <td data-label="Colour">
                      <div class="color-input-wrap">
                        <div class="color-swatch" [style.background]="typo[tag]['color']">
                          <input type="color" [ngModel]="typo[tag]['color']"
                                 (ngModelChange)="typo[tag]['color'] = $event; markDirty()" />
                        </div>
                        <span style="font-size:.8rem;color:var(--text-secondary)">{{ typo[tag]['color'] }}</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Live preview -->
          <p style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:.75rem">Live Preview</p>
          <div class="preview-box">
            <h1 [style.fontFamily]="typo['h1']['fontFamily']" [style.color]="typo['h1']['color']" style="margin:.25rem 0">Heading 1 — {{ typo['h1']['fontFamily'] }}</h1>
            <h2 [style.fontFamily]="typo['h2']['fontFamily']" [style.color]="typo['h2']['color']" style="margin:.25rem 0">Heading 2 — {{ typo['h2']['fontFamily'] }}</h2>
            <h3 [style.fontFamily]="typo['h3']['fontFamily']" [style.color]="typo['h3']['color']" style="margin:.25rem 0">Heading 3 — {{ typo['h3']['fontFamily'] }}</h3>
            <h4 [style.fontFamily]="typo['h4']['fontFamily']" [style.color]="typo['h4']['color']" style="margin:.25rem 0">Heading 4 — {{ typo['h4']['fontFamily'] }}</h4>
            <hr [style.border-color]="typo['hr']['color']" style="margin:.75rem 0;border-width:1px" />
            <p [style.fontFamily]="typo['p']['fontFamily']" [style.color]="typo['p']['color']" style="margin:.25rem 0">
              Paragraph text — The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>

      }

      <!-- Actions -->
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-end; margin-bottom: 2rem;">
        @if (saveError()) {
          <div class="df-alert df-alert-danger" style="width: 100%;">{{ saveError() }}</div>
        }

        <button class="df-btn df-btn-primary" (click)="save()" [disabled]="!isDirty || saving() || loading()">
          @if (saving()) {
            <svg style="animation:df-spin .7s linear infinite" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10"/>
            </svg>
            Saving…
          } @else {
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Save Profile
          }
        </button>
      </div>

    </main>
  `,
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  saveError = signal('');
  isDirty = false;

  readonly typoTags = [...TYPOGRAPHY_TAGS];
  readonly fonts = FONT_OPTIONS;

  typo: Record<string, Record<string, string>> = this.defaultTypo();

  contact: { contactNumber: string; emergencyNumber: string; whatsappNumber: string; email: string } = {
    contactNumber: '', emergencyNumber: '', whatsappNumber: '', email: ''
  };
  social: SocialPages = {};
  slug: string = '';

  location: { name: string; url: string } = { name: '', url: '' };
  footerSettings: { backgroundColor: string; fontColor: string } = {
    backgroundColor: '#1a2035',
    fontColor: '#ffffff'
  };

  imageSlots: ImageSlot[] = [
    { key: 'background', label: 'Background Image', hint: 'full-page background', icon: '🖼️', url: '', progress: 0, uploading: false },
    { key: 'logo', label: 'Logo', hint: 'company logo', icon: '🔖', url: '', progress: 0, uploading: false },
    { key: 'header', label: 'Cover Image', hint: 'Cover photo on link', icon: '📸', url: '', progress: 0, uploading: false },
  ];

  private uid = '';

  async ngOnInit(): Promise<void> {
    // Get UID
    const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
    this.uid = user!.uid;

    // Load saved profile
    const profile = await this.profileService.getProfile();
    this.slug = profile.slug ?? '';
    if (profile.backgroundUrl) this.slot('background').url = profile.backgroundUrl;
    if (profile.logoUrl) this.slot('logo').url = profile.logoUrl;
    if (profile.headerUrl) this.slot('header').url = profile.headerUrl;

    // Load contact fields
    this.contact.contactNumber = profile.contactNumber ?? '';
    this.contact.emergencyNumber = profile.emergencyNumber ?? '';
    this.contact.whatsappNumber = profile.whatsappNumber ?? '';
    this.contact.email = profile.email ?? '';
    this.social = { ...profile.socialPages };

    if (profile.location) {
      this.location = { ...profile.location };
    }
    if (profile.footerSettings) {
      this.footerSettings = { ...profile.footerSettings };
    }

    if (profile.typography) {
      for (const tag of this.typoTags) {
        const t = profile.typography[tag as keyof typeof profile.typography] as any;
        if (t) this.typo[tag] = { ...this.typo[tag], ...t };
      }
    }

    this.loading.set(false);
  }

  triggerFileInput(key: string): void {
    (document.getElementById('file-' + key) as HTMLInputElement)?.click();
  }

  onFileChange(event: Event, slot: ImageSlot): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    slot.uploading = true;
    slot.progress = 0;

    const upload$ = slot.key === 'background'
      ? this.storageService.uploadProfileBackground(file, this.uid)
      : slot.key === 'logo'
        ? this.storageService.uploadProfileLogo(file, this.uid)
        : this.storageService.uploadProfileHeader(file, this.uid);

    upload$.subscribe({
      next: (evt: UploadEvent) => {
        slot.progress = evt.progress;
        if (evt.downloadURL) {
          slot.url = evt.downloadURL;
          slot.uploading = false;
          this.isDirty = true;
          // Auto-save the image URL immediately
          const update: Record<string, string> = {};
          update[`${slot.key}Url`] = evt.downloadURL;
          if (evt.storagePath) update[`${slot.key}Path`] = evt.storagePath;
          this.profileService.saveProfile(update as any).catch(e => this.saveError.set(e.message));
        }
      },
      error: (e: Error) => { slot.uploading = false; this.saveError.set(e.message); },
    });
  }

  markDirty(): void { this.isDirty = true; }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set('');
    try {
      // Firebase Realtime DB does not accept `undefined`. 
      // We pass `null` or the string value directly so it doesn't throw.
      await this.profileService.saveProfile({
        typography: this.typo as any,
        contactNumber: this.contact.contactNumber || null,
        emergencyNumber: this.contact.emergencyNumber || null,
        whatsappNumber: this.contact.whatsappNumber || null,
        email: this.contact.email || null,
        socialPages: {
          facebook: this.social.facebook || null,
          instagram: this.social.instagram || null,
          twitter: this.social.twitter || null,
          linkedin: this.social.linkedin || null,
          youtube: this.social.youtube || null,
        },
        location: {
          name: this.location.name || '',
          url: this.location.url || ''
        },
        footerSettings: {
          backgroundColor: this.footerSettings.backgroundColor,
          fontColor: this.footerSettings.fontColor
        },
        slug: this.slug || null
      } as any);
      this.isDirty = false;
    } catch (e: any) {
      this.saveError.set(e.message);
    } finally {
      this.saving.set(false);
    }
  }

  private slot(key: string): ImageSlot {
    return this.imageSlots.find(s => s.key === key)!;
  }

  private defaultTypo(): Record<string, Record<string, string>> {
    const d: Record<string, Record<string, string>> = {};
    for (const tag of TYPOGRAPHY_TAGS) {
      const defaults = DEFAULT_TYPOGRAPHY[tag] as any;
      d[tag] = { color: defaults.color, fontFamily: defaults.fontFamily ?? '' };
    }
    return d;
  }
}

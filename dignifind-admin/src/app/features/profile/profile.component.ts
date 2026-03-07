import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ProfileService, ProfileData, TypographyStyle, DEFAULT_TYPOGRAPHY, FONT_OPTIONS } from '../../core/services/profile.service';
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

        .typo-table { width: 100%; border-collapse: collapse; }
        .typo-table th, .typo-table td {
            padding: .6rem .75rem; border-bottom: 1px solid var(--border);
            text-align: left; font-size: .85rem;
        }
        .typo-table th {
            font-size: .72rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: .06em; color: var(--text-muted);
        }
        .typo-table tr:last-child td { border-bottom: none; }

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
        .save-overlay {
            position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 500;
        }
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
                <div class="img-slot" (click)="triggerFileInput(slot.key)">
                  <!-- Preview -->
                  @if (slot.url) {
                    <div class="img-slot-preview" [style.background-image]="'url(' + slot.url + ')'">
                      <span class="img-change-badge">Change</span>
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

        <!-- ── Typography ─────────────────────────────────── -->
        <div class="df-card" style="margin-bottom:5rem">
          <p class="section-label">Typography Styles</p>
          <div class="df-table-wrap" style="margin-bottom:1.5rem">
            <table class="typo-table">
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
                    <td><span class="tag-label">{{ tag }}</span></td>
                    <td>
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
                    <td>
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

      @if (saveError()) {
        <div class="df-alert df-alert-danger" style="position:fixed;bottom:5rem;right:1.5rem;z-index:501">{{ saveError() }}</div>
      }

      <!-- Sticky save button -->
      <div class="save-overlay">
        <button class="df-btn df-btn-primary" (click)="save()" [disabled]="saving() || loading()">
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

    imageSlots: ImageSlot[] = [
        { key: 'background', label: 'Background Image', hint: 'full-page background', icon: '🖼️', url: '', progress: 0, uploading: false },
        { key: 'logo', label: 'Logo', hint: 'company logo', icon: '🔖', url: '', progress: 0, uploading: false },
        { key: 'header', label: 'Header Image', hint: 'page header banner', icon: '📸', url: '', progress: 0, uploading: false },
    ];

    private uid = '';

    async ngOnInit(): Promise<void> {
        // Get UID
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        this.uid = user!.uid;

        // Load saved profile
        const profile = await this.profileService.getProfile();
        if (profile.backgroundUrl) this.slot('background').url = profile.backgroundUrl;
        if (profile.logoUrl) this.slot('logo').url = profile.logoUrl;
        if (profile.headerUrl) this.slot('header').url = profile.headerUrl;

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
            await this.profileService.saveProfile({ typography: this.typo as any });
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

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../core/services/provider.service';
import { StorageService } from '../../../core/services/storage.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="df-page">
      <div class="df-page-header">
        <div>
          <h1>Add Service Provider</h1>
          <p style="margin:0;font-size:.85rem;color:var(--text-muted)">Register a new funeral service provider</p>
        </div>
      </div>

      <div class="df-card" style="max-width:560px">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="df-form-group">
            <label for="providerName">Provider Name <span style="color:var(--accent)">*</span></label>
            <input id="providerName" class="df-input" formControlName="providerName"
                   placeholder="e.g. Sunrise Funeral Home" />
          </div>

          <div class="df-form-group">
            <label for="providerType">Provider Type <span style="color:var(--accent)">*</span></label>
            <select id="providerType" class="df-select" formControlName="providerType">
              <option value="undertaker">Undertaker</option>
              <option value="tombstone">Tombstone Manufacturer</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div class="df-form-group">
            <label for="providerwebsite">Website <span style="color:var(--accent)">*</span></label>
            <input id="providerwebsite" class="df-input" formControlName="providerwebsite"
                   placeholder="https://example.com" type="url" />
          </div>

          <div class="df-form-group">
            <label for="logo">Logo <span style="color:var(--text-muted);font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <input id="logo" class="df-input" type="file" accept="image/*"
                   (change)="onFile($event)" style="padding:.5rem .9rem" />
          </div>

          @if (error) {
            <div class="df-alert df-alert-danger" role="alert">{{ error }}</div>
          }

          <div class="df-divider"></div>

          <div style="display:flex;gap:.75rem;flex-wrap:wrap">
            <a class="df-btn df-btn-ghost" routerLink="/funerals">Cancel</a>
            <button type="reset" class="df-btn df-btn-ghost" (click)="error=''">Clear</button>
            <button type="submit" class="df-btn df-btn-primary"
                    [disabled]="loading || form.invalid">
              @if (loading) {
                <svg style="animation:df-spin .7s linear infinite" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10"/>
                </svg>
                Saving…
              } @else {
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Save Provider
              }
            </button>
          </div>

        </form>
      </div>
    </main>
  `,
})
export class ProviderFormComponent {
  private fb = inject(FormBuilder);
  private providerService = inject(ProviderService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  form = this.fb.group({
    providerName: ['', Validators.required],
    providerType: ['undertaker', Validators.required],
    providerwebsite: ['', Validators.required],
  });

  selectedFile: File | null = null;
  loading = false;
  error = '';

  onFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const save = (logoUrl?: string) => {
      const v = this.form.value;
      this.providerService.saveProvider({
        providerName: v.providerName ?? '',
        providerType: (v.providerType ?? 'undertaker') as 'undertaker' | 'tombstone' | 'both',
        providerwebsite: v.providerwebsite ?? '',
        ...(logoUrl ? { providerlogo: logoUrl } : {}),
      })
        .then(() => this.router.navigate(['/funerals']))
        .catch(e => { this.error = e.message; this.loading = false; });
    };

    if (this.selectedFile) {
      this.storageService.uploadProviderLogo(this.selectedFile).subscribe({
        next: event => { if (event.downloadURL) save(event.downloadURL); },
        error: e => { this.error = e.message; this.loading = false; },
      });
    } else {
      save();
    }
  }
}

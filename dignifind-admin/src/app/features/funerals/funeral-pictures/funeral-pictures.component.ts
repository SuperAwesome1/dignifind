import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FuneralService } from '../../../core/services/funeral.service';
import { StorageService } from '../../../core/services/storage.service';
import { StorageService as StorageSvc } from '../../../core/services/storage.service';
import { GalleryImage } from '../../../core/models/funeral.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

interface UiGalleryItem {
  key: string;
  url: string;
  path: string;
  deleting?: boolean;
}

@Component({
  selector: 'app-funeral-pictures',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  styles: [`
    .upload-zone {
      border: 2px dashed #0f3460;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: rgba(15,52,96,0.08);
      position: relative;
    }
    .upload-zone:hover, .upload-zone.dragover {
      border-color: #e94560;
      background: rgba(233,69,96,0.07);
    }
    .upload-zone input[type=file] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
    }
    .progress { height: 20px; border-radius: 8px; background: #111; }
    .progress-bar { transition: width 0.2s ease; font-size:0.8rem; font-weight:600; }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }
    .gallery-card {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      background: #16213e;
      border: 1px solid #0f3460;
    }
    .gallery-card img {
      width: 100%; height: 140px; object-fit: cover; display: block;
    }
    .gallery-card .del-btn {
      position: absolute; top: 6px; right: 6px;
      background: rgba(200,50,50,0.88);
      border: none; border-radius: 50%;
      width: 28px; height: 28px;
      color: #fff; font-size: 0.75rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s;
    }
    .gallery-card .del-btn:hover { background: #e94560; }
    .toast-success {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
      min-width: 260px; animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity:0; }
      to   { transform: translateX(0);    opacity:1; }
    }
  `],
  template: `
    <app-navbar></app-navbar>
    <main class="df-page">
      <div class="df-page-header">
        <div>
          <h1>Photos</h1>
          <p style="margin:0;font-size:.85rem;color:var(--text-muted)">Manage images for ID: {{ funeralId }}</p>
        </div>
        <a class="df-btn df-btn-ghost" routerLink="/funerals">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back
        </a>
      </div>

      <!-- ═══ COVER PHOTO ═══ -->
      <div class="df-card" style="margin-bottom:1.5rem">
        <h2 style="font-size:1.1rem;margin-bottom:1rem">Cover Photo</h2>

        @if (coverUrl) {
          <div style="display:flex;gap:1.5rem;align-items:flex-start;margin-bottom:1.5rem;flex-wrap:wrap">
            <img [src]="coverUrl" alt="cover photo"
                 style="max-height:160px; object-fit:contain; border-radius:var(--radius-sm); border:1px solid var(--border)">
            <button class="df-btn df-btn-danger df-btn-sm" (click)="deleteCover()" [disabled]="deletingCover">
              @if (deletingCover) { 
                <svg style="animation:df-spin .7s linear infinite" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10"/>
                </svg>
              }
              Delete Cover
            </button>
          </div>
        }

        <!-- Cover upload zone -->
        <div class="upload-zone" style="margin-bottom:1rem" [class.dragover]="coverDragging"
             (dragover)="coverDragging=true; $event.preventDefault()"
             (dragleave)="coverDragging=false"
             (drop)="onCoverDrop($event)">
          <input type="file" accept="image/*" (change)="onCoverFile($event)" [disabled]="coverUploading">
          <div style="font-size:2rem;color:var(--text-muted);margin-bottom:.5rem">🖼️</div>
          <p style="margin:0;font-weight:600;font-size:.9rem">{{ coverUrl ? 'Replace cover photo' : 'Upload cover photo' }}</p>
          <p style="margin:0;color:var(--text-muted);font-size:0.75rem">Click or drag & drop</p>
        </div>

        @if (coverPreview) {
          <img [src]="coverPreview" alt="preview"
               style="max-height:120px; object-fit:contain; border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:1rem">
        }

        @if (coverUploading) {
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-secondary);margin-bottom:.4rem">
              <span>Uploading cover…</span><span>{{ coverProgress }}%</span>
            </div>
            <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
              <div style="height:100%;background:var(--primary);transition:width .2s"
                   [style.width]="coverProgress + '%'"></div>
            </div>
          </div>
        }

        @if (coverFile && !coverUploading) {
          <div style="display:flex;gap:.5rem">
            <button class="df-btn df-btn-primary df-btn-sm" (click)="uploadCover()">Upload</button>
            <button class="df-btn df-btn-ghost df-btn-sm" (click)="clearCoverFile()">Clear</button>
          </div>
        }
      </div>

      <!-- ═══ GALLERY ═══ -->
      <div class="df-card">
        <h2 style="font-size:1.1rem;margin-bottom:1rem">Gallery
          <span class="df-badge" style="margin-left:.5rem">{{ galleryItems.length }}</span>
        </h2>

        @if (galleryItems.length > 0) {
          <div class="gallery-grid" style="margin-bottom:1.5rem">
            @for (item of galleryItems; track item.key) {
              <div class="gallery-card">
                <img [src]="item.url" [alt]="item.key">
                <button class="del-btn" (click)="deleteGalleryItem(item)"
                        [disabled]="item.deleting" title="Delete">
                  @if (item.deleting) {
                    <svg style="animation:df-spin .7s linear infinite" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10"/>
                    </svg>
                  } @else {
                    ✕
                  }
                </button>
              </div>
            }
          </div>
        } @else {
          <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:1.5rem">No gallery images yet.</p>
        }

        <!-- Gallery upload zone -->
        <div class="upload-zone" style="margin-bottom:1rem" [class.dragover]="galleryDragging"
             (dragover)="galleryDragging=true; $event.preventDefault()"
             (dragleave)="galleryDragging=false"
             (drop)="onGalleryDrop($event)">
          <input type="file" accept="image/*" multiple (change)="onGalleryFiles($event)" [disabled]="galleryUploading">
          <div style="font-size:2rem;color:var(--text-muted);margin-bottom:.5rem">📸</div>
          <p style="margin:0;font-weight:600;font-size:.9rem">Add gallery images</p>
          <p style="margin:0;color:var(--text-muted);font-size:0.75rem">Click or drag & drop — multiple files allowed</p>
        </div>

        @if (galleryQueue.length > 0) {
          <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:.5rem">{{ galleryQueue.length }} file(s) queued</p>
        }

        @if (galleryUploading) {
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--text-secondary);margin-bottom:.4rem">
              <span>Uploading {{ galleryUploadIndex + 1 }} / {{ galleryQueue.length }}…</span>
              <span>{{ galleryProgress }}%</span>
            </div>
            <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
              <div style="height:100%;background:var(--success);transition:width .2s"
                   [style.width]="galleryProgress + '%'"></div>
            </div>
          </div>
        }

        @if (galleryQueue.length > 0 && !galleryUploading) {
          <div style="display:flex;gap:.5rem;margin-top:1rem">
            <button class="df-btn df-btn-primary df-btn-sm" (click)="uploadGallery()">
              Upload {{ galleryQueue.length }} image(s)
            </button>
            <button class="df-btn df-btn-ghost df-btn-sm" (click)="clearGalleryQueue()">Clear</button>
          </div>
        }

        @if (error) {
          <div class="df-alert df-alert-danger" style="margin-top:1.5rem">{{ error }}</div>
        }
      </div>
    </main>

    @if (showToast) {
      <div class="toast-success df-alert df-alert-success" style="box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:.75rem">
        <div style="font-size:1.25rem">✓</div>
        <div>
          <strong style="display:block;font-size:.9rem">Done!</strong>
          <span style="font-size:.8rem">{{ toastMessage }}</span>
        </div>
        <button type="button" style="margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;font-size:1.2rem;padding:0 .5rem" (click)="showToast=false">×</button>
      </div>
    }
  `,
})
export class FuneralPicturesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private funeralService = inject(FuneralService);
  private storageService = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);

  funeralId = '';

  // Cover photo
  coverUrl = '';
  coverFile: File | null = null;
  coverPreview = '';
  coverUploading = false;
  coverProgress = 0;
  coverDragging = false;
  deletingCover = false;

  // Gallery
  galleryItems: UiGalleryItem[] = [];
  galleryQueue: File[] = [];
  galleryUploading = false;
  galleryProgress = 0;
  galleryUploadIndex = 0;
  galleryDragging = false;

  // Shared
  error = '';
  showToast = false;
  toastMessage = '';

  async ngOnInit(): Promise<void> {
    this.funeralId = this.route.snapshot.paramMap.get('id') ?? '';
    const funeral = await this.funeralService.getFuneral(this.funeralId);
    if (funeral) {
      this.coverUrl = funeral.picture ?? '';
      if (funeral.gallery) {
        this.galleryItems = Object.entries(funeral.gallery).map(([key, img]) => ({
          key, url: img.url, path: img.path,
        }));
      }
      this.cdr.markForCheck();
    }
  }

  // ── Cover Photo ─────────────────────────────────────────────────────────────

  onCoverFile(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.setCoverFile(f);
  }

  onCoverDrop(e: DragEvent): void {
    e.preventDefault(); this.coverDragging = false;
    this.setCoverFile(e.dataTransfer?.files?.[0] ?? null);
  }

  private setCoverFile(f: File | null): void {
    this.coverFile = f;
    this.coverPreview = f ? URL.createObjectURL(f) : '';
    this.error = '';
    this.cdr.markForCheck();
  }

  clearCoverFile(): void { this.setCoverFile(null); }

  uploadCover(): void {
    if (!this.coverFile) return;
    this.coverUploading = true; this.coverProgress = 0;
    this.storageService.uploadFuneralPicture(this.coverFile).subscribe({
      next: evt => {
        this.coverProgress = evt.progress;
        this.cdr.markForCheck();
        if (evt.downloadURL) {
          this.funeralService.saveFuneral({ graveNumber: this.funeralId, picture: evt.downloadURL })
            .then(() => {
              this.coverUrl = evt.downloadURL!;
              this.coverUploading = false;
              this.clearCoverFile();
              this.toast('Cover photo updated!');
            })
            .catch(err => { this.error = err.message; this.coverUploading = false; this.cdr.markForCheck(); });
        }
      },
      error: err => { this.error = err.message; this.coverUploading = false; this.cdr.markForCheck(); },
    });
  }

  deleteCover(): void {
    if (!confirm('Delete the cover photo?')) return;
    this.deletingCover = true;
    const promises: Promise<any>[] = [this.funeralService.deleteCoverPhoto(this.funeralId)];
    Promise.all(promises).then(() => {
      this.coverUrl = '';
      this.deletingCover = false;
      this.toast('Cover photo deleted.');
    }).catch(err => { this.error = err.message; this.deletingCover = false; this.cdr.markForCheck(); });
  }

  // ── Gallery ─────────────────────────────────────────────────────────────────

  onGalleryFiles(e: Event): void {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    this.galleryQueue = [...this.galleryQueue, ...files];
    this.cdr.markForCheck();
  }

  onGalleryDrop(e: DragEvent): void {
    e.preventDefault(); this.galleryDragging = false;
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    this.galleryQueue = [...this.galleryQueue, ...files];
    this.cdr.markForCheck();
  }

  clearGalleryQueue(): void { this.galleryQueue = []; this.cdr.markForCheck(); }

  uploadGallery(): void {
    if (!this.galleryQueue.length) return;
    this.galleryUploading = true;
    this.galleryUploadIndex = 0;
    this.uploadNextGalleryFile();
  }

  private uploadNextGalleryFile(): void {
    if (this.galleryUploadIndex >= this.galleryQueue.length) {
      this.galleryUploading = false;
      this.galleryQueue = [];
      this.toast(`${this.galleryItems.length} gallery image(s) saved.`);
      return;
    }
    const file = this.galleryQueue[this.galleryUploadIndex];
    this.galleryProgress = 0;

    this.storageService.uploadGalleryImage(file).subscribe({
      next: evt => {
        this.galleryProgress = evt.progress;
        this.cdr.markForCheck();
        if (evt.downloadURL && evt.storagePath) {
          const key = `${Date.now()}_${this.galleryUploadIndex}`;
          const image: GalleryImage = { url: evt.downloadURL, path: evt.storagePath };
          this.funeralService.addGalleryImage(this.funeralId, key, image)
            .then(() => {
              this.galleryItems = [...this.galleryItems, { key, ...image }];
              this.galleryUploadIndex++;
              this.cdr.markForCheck();
              this.uploadNextGalleryFile();
            })
            .catch(err => { this.error = err.message; this.galleryUploading = false; this.cdr.markForCheck(); });
        }
      },
      error: err => { this.error = err.message; this.galleryUploading = false; this.cdr.markForCheck(); },
    });
  }

  deleteGalleryItem(item: UiGalleryItem): void {
    if (!confirm('Delete this photo?')) return;
    item.deleting = true;
    this.cdr.markForCheck();

    // Delete from Storage + Database in parallel
    Promise.all([
      this.storageService.deleteFile(item.path),
      this.funeralService.deleteGalleryImage(this.funeralId, item.key),
    ]).then(() => {
      this.galleryItems = this.galleryItems.filter(i => i.key !== item.key);
      this.toast('Photo deleted.');
    }).catch(err => {
      item.deleting = false;
      this.error = err.message;
      this.cdr.markForCheck();
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private toast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.showToast = false; this.cdr.markForCheck(); }, 4000);
  }
}

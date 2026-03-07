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
    <div class="container pt-5 mt-3" style="max-width:760px">
      <div class="d-flex align-items-center gap-2 mb-3">
        <a class="btn btn-sm btn-outline-secondary" routerLink="/funerals">← Back</a>
        <h1 class="mb-0 fs-4">Photos</h1>
        <span class="text-muted small">{{ funeralId }}</span>
      </div>
      <hr>

      <!-- ═══ COVER PHOTO ═══ -->
      <h5 class="mb-3">Cover Photo</h5>

      @if (coverUrl) {
        <div class="d-flex gap-3 align-items-start mb-4">
          <img [src]="coverUrl" alt="cover photo"
               class="img-thumbnail rounded shadow-sm"
               style="max-height:160px; object-fit:contain">
          <button class="btn btn-sm btn-danger" (click)="deleteCover()" [disabled]="deletingCover">
            @if (deletingCover) { <span class="spinner-border spinner-border-sm me-1"></span> }
            Delete Cover
          </button>
        </div>
      }

      <!-- Cover upload zone -->
      <div class="upload-zone mb-2" [class.dragover]="coverDragging"
           (dragover)="coverDragging=true; $event.preventDefault()"
           (dragleave)="coverDragging=false"
           (drop)="onCoverDrop($event)">
        <input type="file" accept="image/*" (change)="onCoverFile($event)" [disabled]="coverUploading">
        <i class="fas fa-image fa-2x mb-2 text-muted"></i>
        <p class="mb-0 fw-semibold small">{{ coverUrl ? 'Replace cover photo' : 'Upload cover photo' }}</p>
        <p class="text-muted" style="font-size:0.78rem">Click or drag & drop</p>
      </div>

      @if (coverPreview) {
        <img [src]="coverPreview" alt="preview"
             class="img-thumbnail mb-2"
             style="max-height:120px; object-fit:contain">
      }

      @if (coverUploading) {
        <div class="mb-2">
          <div class="d-flex justify-content-between small mb-1">
            <span>Uploading cover…</span><span>{{ coverProgress }}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-info"
                 [style.width]="coverProgress + '%'"
                 role="progressbar">{{ coverProgress }}%</div>
          </div>
        </div>
      }

      @if (coverFile && !coverUploading) {
        <div class="d-flex gap-2 mb-4">
          <button class="btn btn-success btn-sm" (click)="uploadCover()">
            <i class="fas fa-upload me-1"></i>Upload
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="clearCoverFile()">Clear</button>
        </div>
      } @else {
        <div class="mb-4"></div>
      }

      <hr>

      <!-- ═══ GALLERY ═══ -->
      <h5 class="mb-3">Gallery
        <span class="badge bg-secondary ms-2">{{ galleryItems.length }}</span>
      </h5>

      @if (galleryItems.length > 0) {
        <div class="gallery-grid mb-4">
          @for (item of galleryItems; track item.key) {
            <div class="gallery-card">
              <img [src]="item.url" [alt]="item.key">
              <button class="del-btn" (click)="deleteGalleryItem(item)"
                      [disabled]="item.deleting" title="Delete">
                @if (item.deleting) {
                  <span class="spinner-border spinner-border-sm"></span>
                } @else {
                  <i class="fas fa-times"></i>
                }
              </button>
            </div>
          }
        </div>
      } @else {
        <p class="text-muted small mb-3">No gallery images yet.</p>
      }

      <!-- Gallery upload zone -->
      <div class="upload-zone mb-2" [class.dragover]="galleryDragging"
           (dragover)="galleryDragging=true; $event.preventDefault()"
           (dragleave)="galleryDragging=false"
           (drop)="onGalleryDrop($event)">
        <input type="file" accept="image/*" multiple (change)="onGalleryFiles($event)" [disabled]="galleryUploading">
        <i class="fas fa-images fa-2x mb-2 text-muted"></i>
        <p class="mb-0 fw-semibold small">Add gallery images</p>
        <p class="text-muted" style="font-size:0.78rem">Click or drag & drop — multiple files allowed</p>
      </div>

      @if (galleryQueue.length > 0) {
        <p class="small text-muted mt-1">{{ galleryQueue.length }} file(s) queued</p>
      }

      @if (galleryUploading) {
        <div class="mb-2">
          <div class="d-flex justify-content-between small mb-1">
            <span>Uploading {{ galleryUploadIndex + 1 }} / {{ galleryQueue.length }}…</span>
            <span>{{ galleryProgress }}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                 [style.width]="galleryProgress + '%'"
                 role="progressbar">{{ galleryProgress }}%</div>
          </div>
        </div>
      }

      @if (galleryQueue.length > 0 && !galleryUploading) {
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-success btn-sm" (click)="uploadGallery()">
            <i class="fas fa-upload me-1"></i>Upload {{ galleryQueue.length }} image(s)
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="clearGalleryQueue()">Clear</button>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger mt-3 d-flex align-items-center gap-2">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>
      }
    </div>

    @if (showToast) {
      <div class="toast-success alert alert-success shadow d-flex align-items-center gap-2 mb-0">
        <i class="fas fa-check-circle fa-lg"></i>
        <div><strong>Done!</strong><br><span class="small">{{ toastMessage }}</span></div>
        <button type="button" class="btn-close ms-auto" (click)="showToast=false"></button>
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

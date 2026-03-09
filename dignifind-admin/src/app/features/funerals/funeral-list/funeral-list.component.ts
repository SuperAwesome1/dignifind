import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FuneralService } from '../../../core/services/funeral.service';
import { Funeral } from '../../../core/models/funeral.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-funeral-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="df-page">

      <!-- Page header -->
      <div class="df-page-header">
        <div>
          <h1>Funeral Register</h1>
          <p style="margin:0;font-size:.85rem;color:var(--text-muted)">
            {{ filtered.length }} record{{ filtered.length !== 1 ? 's' : '' }}
          </p>
        </div>
        <a class="df-btn df-btn-primary" routerLink="/funerals/new">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Add Funeral
        </a>
      </div>

      <!-- Search -->
      <div class="df-actions">
        <div class="df-search">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input type="search" placeholder="Search by name, area…" (input)="onFilter($event)"
                 aria-label="Search funerals" />
        </div>
      </div>

      <!-- Table -->
      <div class="df-table-wrap">
        <table class="df-table" role="grid">
          <thead>
            <tr>
              <th scope="col">Full Name</th>
              <th scope="col">Birth Date</th>
              <th scope="col">Death Date</th>
              <th scope="col">Burial Date</th>
              <th scope="col">Area</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr><td colspan="6"><div class="df-spinner"></div></td></tr>
            } @else if (filtered.length === 0) {
              <tr><td colspan="6"><div class="df-empty">No records found.</div></td></tr>
            } @else {
              @for (f of filtered; track f.id) {
                <tr>
                  <td data-label="Full Name" style="font-weight:500">{{ f.firstName }} {{ f.surname }}</td>
                  <td data-label="Birth Date">{{ formatDate(f.dateOfBirth) }}</td>
                  <td data-label="Death Date">{{ formatDate(f.dateOfDeath) }}</td>
                  <td data-label="Burial Date">{{ formatDate(f.dateOfFuneral) }}</td>
                  <td data-label="Area">
                    @if (f.area) {
                      <span class="df-badge">{{ f.area }}</span>
                    }
                  </td>
                  <td data-label="Actions">
                    <div style="display:flex;gap:.4rem;flex-wrap:wrap">
                      <a class="df-btn df-btn-ghost df-btn-sm" [routerLink]="['/funerals', f.id, 'edit']">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit
                      </a>
                      <a class="df-btn df-btn-ghost df-btn-sm" [routerLink]="['/funerals', f.id, 'pictures']">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Images
                      </a>
                      <button class="df-btn df-btn-danger df-btn-sm" (click)="delete(f)">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

    </main>
  `,
})
export class FuneralListComponent implements OnInit {
  private funeralService = inject(FuneralService);
  private cdr = inject(ChangeDetectorRef);

  funerals: Funeral[] = [];
  filtered: Funeral[] = [];
  loading = true;

  ngOnInit(): void {
    this.funeralService.getMyFunerals().subscribe(data => {
      this.funerals = data;
      this.filtered = data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onFilter(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtered = this.funerals.filter(f =>
      (`${f.firstName} ${f.surname} ${f.area ?? ''}`).toLowerCase().includes(q)
    );
  }

  formatDate(val: string | undefined): string {
    if (!val) return '—';
    const strVal = val.trim();
    if (strVal === '') return '—';
    const epoch = Number(strVal);
    if (!isNaN(epoch)) {
      const d = new Date(epoch);
      return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: '2-digit' });
    }
    return val;
  }

  delete(f: Funeral): void {
    if (!confirm(`Delete funeral for ${f.firstName} ${f.surname}?`)) return;
    this.funeralService.deleteFuneral(f.id!);
  }
}

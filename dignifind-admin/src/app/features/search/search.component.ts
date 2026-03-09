import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuneralService } from '../../core/services/funeral.service';
import { Funeral } from '../../core/models/funeral.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="df-page">
      <div class="df-page-header">
        <div>
          <h1>Find Funerals</h1>
          <p style="margin:0;font-size:.85rem;color:var(--text-muted)">Search across all funeral records</p>
        </div>
      </div>

      <div class="df-actions">
        <div class="df-search">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input type="search" placeholder="Search by name, area…" (input)="onFilter($event)"
                 aria-label="Search funerals" />
        </div>
        <span style="font-size:.82rem;color:var(--text-muted)">{{ filtered.length }} result{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="df-table-wrap">
        <table class="df-table" role="grid">
          <thead>
            <tr>
              <th scope="col">First Name</th>
              <th scope="col">Surname</th>
              <th scope="col">Date of Burial</th>
              <th scope="col">Area</th>
            </tr>
          </thead>
          <tbody>
            @if (loading) {
              <tr><td colspan="4"><div class="df-spinner"></div></td></tr>
            } @else if (filtered.length === 0) {
              <tr><td colspan="4"><div class="df-empty">No results found. Try a different search term.</div></td></tr>
            } @else {
              @for (f of filtered; track f.id) {
                <tr>
                  <td data-label="First Name">{{ f.firstName }}</td>
                  <td data-label="Surname" style="font-weight:500">{{ f.surname }}</td>
                  <td data-label="Date of Burial">{{ formatDate(f.dateOfFuneral) }}</td>
                  <td data-label="Area">
                    @if (f.area) { <span class="df-badge">{{ f.area }}</span> }
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
export class SearchComponent implements OnInit {
  private funeralService = inject(FuneralService);
  private cdr = inject(ChangeDetectorRef);

  funerals: Funeral[] = [];
  filtered: Funeral[] = [];
  loading = true;

  ngOnInit(): void {
    this.funeralService.getAllFunerals().subscribe(data => {
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
    const epoch = Number(val);
    if (!isNaN(epoch) && epoch > 0) {
      const d = new Date(epoch);
      return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: '2-digit' });
    }
    return val;
  }
}

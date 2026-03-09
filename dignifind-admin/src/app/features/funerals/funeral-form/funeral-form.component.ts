import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FuneralService } from '../../../core/services/funeral.service';
import { StorageService } from '../../../core/services/storage.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-funeral-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .section-title {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: var(--primary-light);
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .df-check-row {
      display: flex;
      align-items: center;
      gap: .6rem;
      padding: .65rem .9rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .df-check-row input[type="checkbox"] {
      width: 16px; height: 16px;
      accent-color: var(--primary);
      cursor: pointer;
    }
    .df-check-row label {
      margin: 0;
      font-size: .875rem;
      color: var(--text-secondary);
      cursor: pointer;
    }
    textarea.df-input { resize: vertical; min-height: 100px; }
    .df-section { margin-bottom: 2rem; }
  `],
  template: `
    <app-navbar></app-navbar>

    <main class="df-page">
      <!-- Header -->
      <div class="df-page-header">
        <div>
          <h1>{{ isEdit ? 'Edit' : 'Capture' }} Funeral Details</h1>
          <p style="margin:0;font-size:.85rem;color:var(--text-muted)">
            {{ isEdit ? 'Update the record below' : 'Complete the form to add a new funeral record' }}
          </p>
        </div>
        <a class="df-btn df-btn-ghost" routerLink="/funerals">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">

        <!-- Personal Details -->
        <div class="df-card df-section">
          <p class="section-title">Personal Details</p>
          <div class="form-grid">
            <div class="df-form-group">
              <label for="graveNumber">Grave Number / Link Initial <span style="color:var(--accent)">*</span></label>
              <input id="graveNumber" class="df-input" formControlName="graveNumber" [attr.readonly]="isEdit || null" />
            </div>
            <div class="df-form-group">
              <label for="idNumber">ID Number <span style="color:var(--accent)">*</span></label>
              <input id="idNumber" class="df-input" formControlName="idNumber" />
            </div>
            <div class="df-form-group">
              <label for="surname">Surname <span style="color:var(--accent)">*</span></label>
              <input id="surname" class="df-input" formControlName="surname" />
            </div>
            <div class="df-form-group">
              <label for="firstName">Full Names <span style="color:var(--accent)">*</span></label>
              <input id="firstName" class="df-input" formControlName="firstName" />
            </div>
            <div class="df-form-group">
              <label for="gender">Gender</label>
              <select id="gender" class="df-select" formControlName="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="df-form-group">
              <label for="dateOfBirth">Date of Birth <span style="color:var(--accent)">*</span></label>
              <input id="dateOfBirth" class="df-input" type="date" formControlName="dateOfBirth" />
            </div>
            <div class="df-form-group">
              <label for="dateOfDeath">Date of Death <span style="color:var(--accent)">*</span></label>
              <input id="dateOfDeath" class="df-input" type="date" formControlName="dateOfDeath" />
            </div>
            <div class="df-form-group">
              <label for="dateOfFuneral">Date of Burial <span style="color:var(--accent)">*</span></label>
              <input id="dateOfFuneral" class="df-input" type="date" formControlName="dateOfFuneral" />
            </div>
            <div class="df-form-group">
              <label for="venue">Venue</label>
              <input id="venue" class="df-input" formControlName="venue" />
            </div>
            <div class="df-form-group">
              <label for="time">Time</label>
              <input id="time" class="df-input" formControlName="time" />
            </div>
            <div class="df-form-group">
              <label for="area">Area</label>
              <input id="area" class="df-input" formControlName="area" />
            </div>
            <div class="df-form-group">
              <label for="undertaker">Undertaker</label>
              <input id="undertaker" class="df-input" formControlName="undertaker" />
            </div>
          </div>
        </div>

        <!-- GPS Coordinates -->
        <div class="df-card df-section">
          <p class="section-title">GPS Coordinates</p>
          <div class="form-grid">
            <div class="df-form-group"><label>Home Lat</label><input class="df-input" formControlName="homelat" /></div>
            <div class="df-form-group"><label>Home Lng</label><input class="df-input" formControlName="homelng" /></div>
            <div class="df-form-group"><label>Service Lat</label><input class="df-input" formControlName="servicelat" /></div>
            <div class="df-form-group"><label>Service Lng</label><input class="df-input" formControlName="servicelng" /></div>
            <div class="df-form-group"><label>Cemetery Lat</label><input class="df-input" formControlName="lat" /></div>
            <div class="df-form-group"><label>Cemetery Lng</label><input class="df-input" formControlName="lng" /></div>
          </div>
        </div>

        <!-- Memorial -->
        <div class="df-card df-section">
          <p class="section-title">Memorial</p>
          <div class="form-grid">
            <div class="df-form-group">
              <label>Memorial Service</label>
              <div class="df-check-row">
                <input type="checkbox" id="memorial" formControlName="memorial" />
                <label for="memorial">Has Memorial</label>
              </div>
            </div>
            <div class="df-form-group"><label>Date of Memorial</label><input class="df-input" type="date" formControlName="dateofmemorial" /></div>
            <div class="df-form-group"><label>Venue</label><input class="df-input" formControlName="memorialvenue" /></div>
            <div class="df-form-group"><label>Time</label><input class="df-input" formControlName="memorialtime" /></div>
            <div class="df-form-group"><label>Coordinates</label><input class="df-input" formControlName="memoriallocation" /></div>
          </div>
        </div>

        <!-- Streaming -->
        <div class="df-card df-section">
          <p class="section-title">Live Streaming</p>
          <div class="form-grid">
            <div class="df-form-group">
              <label>Streaming</label>
              <div class="df-check-row">
                <input type="checkbox" id="streaming" formControlName="streaming" />
                <label for="streaming">Enable Streaming</label>
              </div>
            </div>
            <div class="df-form-group"><label>Memorial Stream URL</label><input class="df-input" formControlName="memostream" /></div>
            <div class="df-form-group"><label>Home Stream URL</label><input class="df-input" formControlName="homestream" /></div>
            <div class="df-form-group"><label>Cemetery Stream URL</label><input class="df-input" formControlName="cemstream" /></div>
            <div class="df-form-group"><label>Memorial Stream Time</label><input class="df-input" formControlName="mstreamtime" /></div>
            <div class="df-form-group"><label>Home Stream Time</label><input class="df-input" formControlName="hstreamtime" /></div>
            <div class="df-form-group"><label>Cemetery Stream Time</label><input class="df-input" formControlName="cstreamtime" /></div>
          </div>
        </div>

        <!-- Next of Kin -->
        <div class="df-card df-section">
          <p class="section-title">Next of Kin</p>
          <div class="form-grid">
            <div class="df-form-group"><label>Full Name</label><input class="df-input" formControlName="nextOfKinFullname" /></div>
            <div class="df-form-group"><label>Contacts</label><input class="df-input" formControlName="nextOfKinContacts" /></div>
            <div class="df-form-group"><label>Address</label><textarea class="df-input df-textarea" rows="2" formControlName="nextOfKinAddress"></textarea></div>
          </div>
        </div>

        <!-- Content -->
        <div class="df-card df-section">
          <p class="section-title">Content</p>
          <div class="form-grid-2">
            <div class="df-form-group"><label>Obituary</label><textarea class="df-input df-textarea" rows="6" formControlName="obituary"></textarea></div>
            <div class="df-form-group"><label>Funeral Programme</label><textarea class="df-input df-textarea" rows="6" formControlName="programme"></textarea></div>
            <div class="df-form-group"><label>Memorial Programme</label><textarea class="df-input df-textarea" rows="6" formControlName="memorialprogramme"></textarea></div>
            <div class="df-form-group"><label>Poem</label><textarea class="df-input df-textarea" rows="6" formControlName="poem"></textarea></div>
            <div class="df-form-group"><label>Hymn</label><textarea class="df-input df-textarea" rows="6" formControlName="hymn"></textarea></div>
            <div class="df-form-group"><label>More Info</label><textarea class="df-input df-textarea" rows="6" formControlName="info"></textarea></div>
            <div class="df-form-group"><label>Donations</label><textarea class="df-input df-textarea" rows="3" formControlName="donations"></textarea></div>
            <div class="df-form-group">
              <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.4rem">
                <label style="margin:0">Vote of Thanks</label>
                <div class="df-check-row" style="padding:.3rem .6rem">
                  <input type="checkbox" id="thankson" formControlName="thankson" />
                  <label for="thankson" style="font-size:.8rem">Show</label>
                </div>
              </div>
              <textarea class="df-input df-textarea" rows="3" formControlName="voteofthanks"></textarea>
            </div>
          </div>
        </div>

        <!-- Cover Photo -->
        <div class="df-card df-section">
          <p class="section-title">Cover Photo</p>
          <div class="df-form-group" style="max-width:360px">
            <label>Upload Image</label>
            <input class="df-input" type="file" accept="image/*" (change)="onFile($event)" style="padding:.5rem .9rem" />
          </div>
        </div>

        @if (error) {
          <div class="df-alert df-alert-danger" role="alert">{{ error }}</div>
        }

        <!-- Actions -->
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;padding-bottom:2rem">
          <a class="df-btn df-btn-ghost" routerLink="/funerals">Cancel</a>
          <button type="reset" class="df-btn df-btn-ghost" (click)="error=''">Clear</button>
          <button type="submit" class="df-btn df-btn-primary" [disabled]="loading">
            @if (loading) { Saving… } @else { Save &amp; Continue }
          </button>
        </div>

      </form>
    </main>
  `,
})
export class FuneralFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private funeralService = inject(FuneralService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  loading = false;
  error = '';
  private selectedFile: File | null = null;

  form: FormGroup = this.fb.group({
    graveNumber: ['', Validators.required],
    idNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    surname: ['', Validators.required],
    gender: ['male'],
    dateOfBirth: ['', Validators.required],
    dateOfDeath: ['', Validators.required],
    dateOfFuneral: ['', Validators.required],
    venue: [''], time: [''], area: [''], undertaker: [''],
    homelat: [''], homelng: [''], servicelat: [''], servicelng: [''], lat: [''], lng: [''],
    memorial: [false], dateofmemorial: [''], memorialvenue: [''],
    memorialtime: [''], memoriallocation: [''], memorialprogramme: [''],
    streaming: [false], memostream: [''], homestream: [''], cemstream: [''],
    mstreamtime: [''], hstreamtime: [''], cstreamtime: [''],
    nextOfKinFullname: [''], nextOfKinContacts: [''], nextOfKinAddress: [''],
    obituary: [''], programme: [''], poem: [''], hymn: [''], info: [''],
    donations: [''], voteofthanks: [''], thankson: [false],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      const funeral = await this.funeralService.getFuneral(id);
      if (funeral) {
        this.form.patchValue({
          ...funeral,
          dateOfBirth: this.epochToDateInput(funeral.dateOfBirth),
          dateOfDeath: this.epochToDateInput(funeral.dateOfDeath),
          dateOfFuneral: this.epochToDateInput(funeral.dateOfFuneral),
          dateofmemorial: this.epochToDateInput(funeral.dateofmemorial ?? ''),
        });
      }
    }
  }

  onFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    // On create only: check the grave number isn't already taken
    if (!this.isEdit) {
      const graveNumber = this.form.value.graveNumber?.trim();
      const exists = await this.funeralService.graveNumberExists(graveNumber).catch(() => false);
      if (exists) {
        this.error = `Grave number "${graveNumber}" already exists. Please use a different abbreviation.`;
        this.loading = false;
        return;
      }
    }

    const save = (pictureUrl?: string) => {
      const v = this.form.value;
      const payload = {
        ...v,
        dateOfBirth: this.dateInputToEpoch(v.dateOfBirth),
        dateOfDeath: this.dateInputToEpoch(v.dateOfDeath),
        dateOfFuneral: this.dateInputToEpoch(v.dateOfFuneral),
        dateofmemorial: this.dateInputToEpoch(v.dateofmemorial),
        ...(pictureUrl ? { picture: pictureUrl } : {}),
      };
      this.funeralService.saveFuneral(payload)
        .then(() => this.router.navigate(['/funerals']))
        .catch(e => { this.error = e.message; this.loading = false; });
    };

    if (this.selectedFile) {
      this.storageService.uploadFuneralPicture(this.selectedFile).subscribe({
        next: event => { if (event.downloadURL) save(event.downloadURL); },
        error: e => { this.error = e.message; this.loading = false; },
      });
    } else {
      save();
    }
  }

  private epochToDateInput(val: string | undefined): string {
    if (!val) return '';
    const n = Number(val);
    if (!isNaN(n) && n > 0) {
      const d = new Date(n);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return val;
  }

  private dateInputToEpoch(val: string | undefined): string {
    if (!val) return '';
    return String(new Date(val).getTime());
  }
}

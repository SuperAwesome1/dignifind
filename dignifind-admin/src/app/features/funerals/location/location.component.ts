import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FuneralService } from '../../../core/services/funeral.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
    selector: 'app-location',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
    template: `
    <app-navbar></app-navbar>
    <div class="container pt-5 mt-3">
      <h1>Update Location — {{ funeralId }}</h1>
      <hr>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="row g-3">
          <div class="col-md-3"><label class="form-label">Home Latitude</label><input class="form-control" formControlName="homelat"></div>
          <div class="col-md-3"><label class="form-label">Home Longitude</label><input class="form-control" formControlName="homelng"></div>
          <div class="col-md-3"><label class="form-label">Service Latitude</label><input class="form-control" formControlName="servicelat"></div>
          <div class="col-md-3"><label class="form-label">Service Longitude</label><input class="form-control" formControlName="servicelng"></div>
          <div class="col-md-3"><label class="form-label">Cemetery Latitude</label><input class="form-control" formControlName="lat"></div>
          <div class="col-md-3"><label class="form-label">Cemetery Longitude</label><input class="form-control" formControlName="lng"></div>
        </div>
        @if (success) { <div class="alert alert-success mt-3">Location saved!</div> }
        @if (error) { <div class="alert alert-danger mt-3">{{ error }}</div> }
        <div class="d-flex gap-2 mt-4">
          <a class="btn btn-secondary" routerLink="/funerals">Back</a>
          <button type="submit" class="btn btn-success" [disabled]="loading">
            {{ loading ? 'Saving…' : 'Save Location' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class LocationComponent implements OnInit {
    private fb = inject(FormBuilder);
    private funeralService = inject(FuneralService);
    private route = inject(ActivatedRoute);

    funeralId = '';
    loading = false;
    success = false;
    error = '';

    form = this.fb.group({
        homelat: [''], homelng: [''],
        servicelat: [''], servicelng: [''],
        lat: [''], lng: [''],
    });

    async ngOnInit(): Promise<void> {
        this.funeralId = this.route.snapshot.paramMap.get('id') ?? '';
        const funeral = await this.funeralService.getFuneral(this.funeralId);
        if (funeral) this.form.patchValue(funeral);
    }

    save(): void {
        this.loading = true;
        const v = this.form.value;
        this.funeralService.saveFuneral({
            graveNumber: this.funeralId,
            homelat: v.homelat ?? '',
            homelng: v.homelng ?? '',
            servicelat: v.servicelat ?? '',
            servicelng: v.servicelng ?? '',
            lat: v.lat ?? '',
            lng: v.lng ?? '',
        })
            .then(() => { this.success = true; this.loading = false; })
            .catch(e => { this.error = e.message; this.loading = false; });
    }
}

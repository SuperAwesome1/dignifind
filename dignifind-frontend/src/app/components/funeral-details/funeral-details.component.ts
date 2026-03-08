import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuneralData } from '../../models/funeral.model';
import { FuneralService } from '../../services/funeral.service';

@Component({
    selector: 'app-funeral-details',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="details-block text-center">
      <h1 class="details-title">Funeral Details</h1>
      <p class="detail-line">
        <strong>Date:</strong> {{ funeralService.convertDate(data?.dateOfFuneral) || 'To be uploaded' }}
      </p>
      <p class="detail-line">
        <strong>Venue:</strong> {{ data?.venue || 'Venue: to be uploaded' }}
      </p>
      <p class="detail-line">
        <strong>Time:</strong> {{ data?.time || 'Time: to be uploaded' }}
      </p>
    </div>
  `,
    styles: [`
    .details-block { padding: 10px 0 20px; }
    .details-title { color: #27345C; font-family: 'Times New Roman', Times, serif; }
    .detail-line { color: #000; font-size: 1rem; margin: 6px 0; letter-spacing: 0.5px; }
  `]
})
export class FuneralDetailsComponent {
    @Input() data: FuneralData | null = null;
    constructor(public funeralService: FuneralService) { }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuneralData } from '../../models/funeral.model';

@Component({
    selector: 'app-vote-of-thanks',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (data?.thankson) {
      <section class="thanks-section">
        <div class="container">
          <div class="text-center">
            <h2 class="thanks-heading">Vote of Thanks!</h2>
            <hr class="brand-hr" />
          </div>
          <div class="thanks-message" [innerHTML]="data?.voteofthanks"></div>
          <h3 class="thanks-name text-center">{{ data?.surname }}'s Family</h3>
        </div>
      </section>
    }
  `,
    styles: [`
    .thanks-section { background: #F4F7F7; padding: 40px 0; margin-top: 20px; border-radius: 8px; }
    .thanks-heading { color: #27345C; font-family: 'Times New Roman', Times, serif; margin-top: 0; }
    .brand-hr { border-color: #C49847; border-width: 3px; max-width: 90px; margin: 20px auto; }
    .thanks-message { background: #D7DADA; border-radius: 5px; padding: 15px 20px; font-size: 1.1rem; color: #333; text-align: center; margin: 0 auto 20px; max-width: 700px; line-height: 1.6; }
    .thanks-name { color: #000; font-family: 'Times New Roman', Times, serif; }
  `]
})
export class VoteOfThanksComponent {
    @Input() data: FuneralData | null = null;
}

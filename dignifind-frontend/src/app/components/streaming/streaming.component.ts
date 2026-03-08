import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuneralData } from '../../models/funeral.model';

@Component({
    selector: 'app-streaming',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (showFuneralStream && data?.homestream) {
      <div class="stream-block text-center">
        <hr class="brand-hr" />
        <h2 class="stream-title">Watch Funeral Service</h2>
        <h3 class="stream-time">{{ data?.hstreamtime }}</h3>
        <a [href]="data?.homestream" class="stream-link" target="_blank" rel="noopener">
          <u>Click here to watch</u>
        </a>
      </div>
    }
    @if (showMemorialStream && data?.memostream) {
      <div class="stream-block text-center">
        <hr class="brand-hr" />
        <h2 class="stream-title">Watch Memorial Service</h2>
        <h3 class="stream-time">{{ data?.mstreamtime }}</h3>
        <a [href]="data?.memostream" class="stream-link" target="_blank" rel="noopener">
          <u>Click here to watch</u>
        </a>
      </div>
    }
  `,
    styles: [`
    .stream-block { padding: 10px 0; }
    .stream-title { color: #000; }
    .stream-time { color: #C49847; }
    .stream-link { color: #27345C; font-size: 1.1rem; }
    .brand-hr { border-color: #C49847; border-width: 3px; max-width: 90px; margin: 20px auto; }
  `]
})
export class StreamingComponent {
    @Input() data: FuneralData | null = null;
    @Input() showFuneralStream = false;
    @Input() showMemorialStream = false;
}

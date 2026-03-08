import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FuneralData } from '../../models/funeral.model';
import { FuneralService } from '../../services/funeral.service';

@Component({
    selector: 'app-memorial-programme-accordion',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="accordion-wrapper">
      <!-- Find My Memorial Map -->
      <div class="panel-item">
        <button class="panel-header" (click)="toggleMap()" [attr.aria-expanded]="mapOpen()">
          <span class="panel-icon">📍</span>
          <span class="panel-label">Find My Memorial</span>
          <span class="caret" [class.open]="mapOpen()">▾</span>
        </button>
        <div class="panel-body" [class.open]="mapOpen()">
          <a [href]="directionsUrl()" target="_blank" class="directions-link" rel="noopener">
            <strong>Click here for directions</strong>
          </a>
          @if (mapUrl()) {
            <iframe [src]="mapUrl()!" class="map-frame" loading="lazy" allowfullscreen></iframe>
          }
        </div>
      </div>

      <!-- Find My Programme -->
      <div class="panel-item">
        <button class="panel-header" (click)="toggleProg()" [attr.aria-expanded]="progOpen()">
          <span class="panel-icon">📄</span>
          <span class="panel-label">Find My Programme</span>
          <span class="caret" [class.open]="progOpen()">▾</span>
        </button>
        <div class="panel-body" [class.open]="progOpen()">
          <pre class="content-pre">{{ data?.memorialprogramme || 'To be uploaded...' }}</pre>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .accordion-wrapper { margin-top: 10px; }
    .panel-item { background: rgba(255,255,255,0.93); border-radius: 6px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
    .panel-header { width: 100%; background: transparent; border: none; padding: 14px 16px; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 700; color: #333; font-family: 'Times New Roman', Times, serif; transition: background 0.2s; }
    .panel-header:hover { background: #fdf8ef; }
    .panel-icon { font-size: 1.1rem; }
    .panel-label { flex: 1; }
    .caret { font-size: 1.2rem; color: #C49847; transition: transform 0.25s ease; }
    .caret.open { transform: rotate(180deg); }
    .panel-body { max-height: 0; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease; padding: 0 16px; border-top: 1px solid transparent; }
    .panel-body.open { max-height: 500px; padding: 16px; border-top-color: #f0e8d4; overflow-y: auto; }
    .directions-link { display: inline-block; margin-bottom: 12px; color: #27345C; text-decoration: none; }
    .map-frame { width: 100%; height: 280px; border: none; border-radius: 6px; }
    .content-pre { white-space: pre-wrap; font-family: 'Times New Roman', Times, serif; font-size: 1rem; color: #333; line-height: 1.6; margin: 0; }
  `]
})
export class MemorialProgrammeAccordionComponent {
    @Input() set data(val: FuneralData | null) {
        this._data = val;
        this.buildUrls();
    }
    get data(): FuneralData | null { return this._data; }
    private _data: FuneralData | null = null;

    mapOpen = signal(false);
    progOpen = signal(false);
    mapUrl = signal<SafeResourceUrl | null>(null);
    directionsUrl = signal<string>('#');

    constructor(public funeralService: FuneralService, private sanitizer: DomSanitizer) { }

    private buildUrls(): void {
        if (this._data?.memoriallocation) {
            const loc = this._data.memoriallocation;
            const embedUrl = `https://www.google.com/maps/embed/v1/place?zoom=15&key=AIzaSyBBkmORi786_fXlxb0jjBlielbo19d3s98&q=${loc}`;
            this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
            this.directionsUrl.set(`https://www.google.com/maps/search/?api=1&query=${loc}`);
        }
    }

    toggleMap(): void { this.mapOpen.update(v => !v); }
    toggleProg(): void { this.progOpen.update(v => !v); }
}

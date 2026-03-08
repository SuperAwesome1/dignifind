import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FuneralData } from '../../models/funeral.model';
import { FuneralService } from '../../services/funeral.service';

interface Panel {
    id: string;
    icon: string;
    label: string;
    type: 'map' | 'text' | 'bible';
}

@Component({
    selector: 'app-programme-accordion',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="accordion-wrapper">
      @for (panel of panels; track panel.id) {
        <div class="panel-item">
          <button class="panel-header" (click)="toggle(panel.id)" [attr.aria-expanded]="isOpen(panel.id)">
            <span class="panel-icon">{{ panel.icon }}</span>
            <span class="panel-label">{{ panel.label }}</span>
            <span class="caret" [class.open]="isOpen(panel.id)">▾</span>
          </button>
          <div class="panel-body" [class.open]="isOpen(panel.id)">
            @if (panel.type === 'map') {
              <ng-container [ngSwitch]="panel.id">
                <ng-container *ngSwitchCase="'home'">
                  <a [href]="funeralService.buildGoogleMapsDirectionsUrl(data?.homelat, data?.homelng)" target="_blank" class="directions-link">
                    <strong>Click here for directions</strong>
                  </a>
                  @if (homeMapUrl()) {
                    <iframe [src]="homeMapUrl()!" class="map-frame" loading="lazy" allowfullscreen></iframe>
                  }
                </ng-container>
                <ng-container *ngSwitchCase="'service'">
                  <a [href]="funeralService.buildGoogleMapsDirectionsUrl(data?.servicelat, data?.servicelng)" target="_blank" class="directions-link">
                    <strong>Click here for directions</strong>
                  </a>
                  @if (serviceMapUrl()) {
                    <iframe [src]="serviceMapUrl()!" class="map-frame" loading="lazy" allowfullscreen></iframe>
                  }
                </ng-container>
                <ng-container *ngSwitchCase="'cemetery'">
                  <a [href]="funeralService.buildGoogleMapsDirectionsUrl(data?.lat, data?.lng)" target="_blank" class="directions-link">
                    <strong>Click here for directions</strong>
                  </a>
                  @if (cemeteryMapUrl()) {
                    <iframe [src]="cemeteryMapUrl()!" class="map-frame" loading="lazy" allowfullscreen></iframe>
                  }
                </ng-container>
              </ng-container>
            } @else if (panel.type === 'text') {
              <div class="text-content">
                <ng-container [ngSwitch]="panel.id">
                  <ng-container *ngSwitchCase="'programme'">
                    <pre class="content-pre">{{ data?.programme || 'To be uploaded...' }}</pre>
                  </ng-container>
                  <ng-container *ngSwitchCase="'obituary'">
                    <pre class="content-pre">{{ data?.obituary || 'To be uploaded...' }}</pre>
                  </ng-container>
                  <ng-container *ngSwitchCase="'hymns'">
                    <pre class="content-pre">{{ data?.hymn || 'To be uploaded...' }}</pre>
                  </ng-container>
                  <ng-container *ngSwitchCase="'info'">
                    <pre class="content-pre">{{ data?.info || 'To be uploaded...' }}</pre>
                  </ng-container>
                </ng-container>
              </div>
            } @else if (panel.type === 'bible') {
              <div class="bible-widget">
                <p>Search the Bible</p>
                <a href="https://www.biblegateway.com/passage/?search=John+1:1-2" target="_blank" class="bible-link" rel="noopener">
                  Open Bible Search ↗
                </a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
    styleUrl: './programme-accordion.component.scss'
})
export class ProgrammeAccordionComponent {
    @Input() set data(val: FuneralData | null) {
        this._data = val;
        this.buildUrls();
    }
    get data(): FuneralData | null { return this._data; }
    private _data: FuneralData | null = null;

    homeMapUrl = signal<SafeResourceUrl | null>(null);
    serviceMapUrl = signal<SafeResourceUrl | null>(null);
    cemeteryMapUrl = signal<SafeResourceUrl | null>(null);

    private openPanels = signal<Set<string>>(new Set());

    panels: Panel[] = [
        { id: 'home', icon: '📍', label: 'Find My Home', type: 'map' },
        { id: 'service', icon: '📌', label: 'Find My Service', type: 'map' },
        { id: 'cemetery', icon: '🪦', label: 'Find My Cemetery', type: 'map' },
        { id: 'programme', icon: '📄', label: 'Find My Programme', type: 'text' },
        { id: 'obituary', icon: '📝', label: 'Find My Obituary', type: 'text' },
        { id: 'hymns', icon: '🎵', label: 'Hymns & Scriptures', type: 'text' },
        { id: 'info', icon: 'ℹ️', label: 'Find More Info', type: 'text' },
        { id: 'bible', icon: '📖', label: 'Your Online Bible', type: 'bible' },
    ];

    constructor(public funeralService: FuneralService, private sanitizer: DomSanitizer) { }

    private buildUrls(): void {
        if (this._data) {
            const home = this.funeralService.buildGoogleMapsEmbedUrl(this._data.homelat, this._data.homelng);
            const service = this.funeralService.buildGoogleMapsEmbedUrl(this._data.servicelat, this._data.servicelng);
            const cemetery = this.funeralService.buildGoogleMapsEmbedUrl(this._data.lat, this._data.lng);

            this.homeMapUrl.set(home ? this.sanitizer.bypassSecurityTrustResourceUrl(home) : null);
            this.serviceMapUrl.set(service ? this.sanitizer.bypassSecurityTrustResourceUrl(service) : null);
            this.cemeteryMapUrl.set(cemetery ? this.sanitizer.bypassSecurityTrustResourceUrl(cemetery) : null);
        }
    }

    toggle(id: string): void {
        const current = new Set(this.openPanels());
        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }
        this.openPanels.set(current);
    }

    isOpen(id: string): boolean {
        return this.openPanels().has(id);
    }
}

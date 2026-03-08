import { Component, AfterViewInit, OnChanges, Input, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-tributes',
    standalone: true,
    template: `
    <section class="tributes-section">
      <div class="container">
        <div class="row">
          <div class="col text-center">
            <h1 class="tributes-heading">Say Goodbye Here</h1>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div id="disqus_thread"></div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .tributes-section { background: rgba(255,255,255,0.9); padding: 40px 0; }
    .tributes-heading { color: #27345C; font-family: 'Times New Roman', Times, serif; margin-bottom: 30px; }
  `]
})
export class TributesComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        const d = document;
        const s = d.createElement('script');
        s.src = 'https://dignifind-co-za-1.disqus.com/embed.js';
        s.setAttribute('data-timestamp', String(+new Date()));
        (d.head || d.body).appendChild(s);
    }
}

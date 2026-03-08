import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuneralData } from '../../models/funeral.model';
import { FuneralService } from '../../services/funeral.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="about" class="about-section">
      <div class="container">

        <!-- Title -->
        <div class="row">
          <div class="col text-center">
            <h1 class="in-loving-memory"><i>In<br>Loving Memory<br>Of</i></h1>
          </div>
        </div>

        <!-- Carousel + Info Card -->
        <div class="row justify-content-center">
          <div class="col-lg-8 col-md-10 col-12">
            <div class="our-team">

              <!-- Carousel -->
              <div class="carousel-wrapper">
                <div class="carousel-container">
                  @if (images().length > 0) {
                    <div class="carousel">
                      <button class="carousel-btn prev" (click)="prevSlide()">&#8249;</button>
                      <div class="carousel-slide">
                        <img [src]="images()[currentIndex()]" class="carousel-img" alt="Deceased photo" />
                      </div>
                      <button class="carousel-btn next" (click)="nextSlide()">&#8250;</button>
                    </div>
                    @if (images().length > 1) {
                      <div class="carousel-dots">
                        @for (img of images(); track img; let i = $index) {
                          <span class="dot" [class.active]="i === currentIndex()" (click)="goToSlide(i)"></span>
                        }
                      </div>
                    }
                  } @else {
                    <div class="no-photo">
                      <span>📷</span>
                      <p>Photo to be uploaded</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Name + Dates -->
              <div class="member-des text-center">
                <h1 class="deceased-name">{{ data?.firstName }} {{ data?.surname }}</h1>
                @if (data?.dateOfBirth) {
                  <p class="date-line">☀️ Sunrise: {{ funeralService.convertDate(data?.dateOfBirth) }}</p>
                }
                @if (data?.dateOfDeath) {
                  <p class="date-line">🌙 Sunset: {{ funeralService.convertDate(data?.dateOfDeath) }}</p>
                }
                @if (data?.dateOfUnveiling) {
                  <h4 class="unveiling-date">Date of Unveiling: {{ funeralService.convertDate(data?.dateOfUnveiling) }}</h4>
                }
              </div>

              <hr class="brand-hr" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  @Input() data: FuneralData | null = null;

  images = signal<string[]>([]);
  currentIndex = signal(0);

  constructor(public funeralService: FuneralService) { }

  ngOnInit(): void {
    const pics: string[] = [];
    if (this.data?.pictures) {
      const p = this.data.pictures;
      if (p.pic5) pics.push(p.pic5);
      if (p.pic4) pics.push(p.pic4);
      if (p.pic3) pics.push(p.pic3);
      if (p.pic2) pics.push(p.pic2);
      if (p.pic1) pics.push(p.pic1);
    }
    if (this.data?.picture && pics.length === 0) {
      pics.push(this.data.picture);
    }
    this.images.set(pics);
  }

  prevSlide(): void {
    const len = this.images().length;
    this.currentIndex.set((this.currentIndex() - 1 + len) % len);
  }

  nextSlide(): void {
    const len = this.images().length;
    this.currentIndex.set((this.currentIndex() + 1) % len);
  }

  goToSlide(i: number): void {
    this.currentIndex.set(i);
  }
}

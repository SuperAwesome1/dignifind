import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FuneralService } from '../../services/funeral.service';
import { ProfileService } from '../../services/profile.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { FuneralDetailsComponent } from '../../components/funeral-details/funeral-details.component';
import { MemorialDetailsComponent } from '../../components/memorial-details/memorial-details.component';
import { StreamingComponent } from '../../components/streaming/streaming.component';
import { ProgrammeAccordionComponent } from '../../components/programme-accordion/programme-accordion.component';
import { MemorialProgrammeAccordionComponent } from '../../components/memorial-programme-accordion/memorial-programme-accordion.component';
import { VoteOfThanksComponent } from '../../components/vote-of-thanks/vote-of-thanks.component';
import { InformOthersComponent } from '../../components/inform-others/inform-others.component';
import { TributesComponent } from '../../components/tributes/tributes.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { DEFAULT_PROVIDER } from '../../firebase.config';

@Component({
    selector: 'app-service-programme',
    standalone: true,
    imports: [
        CommonModule,
        NavbarComponent,
        HeroComponent,
        FuneralDetailsComponent,
        MemorialDetailsComponent,
        StreamingComponent,
        ProgrammeAccordionComponent,
        MemorialProgrammeAccordionComponent,
        VoteOfThanksComponent,
        InformOthersComponent,
        TributesComponent,
        FooterComponent,
    ],
    templateUrl: './service-programme.component.html',
    styleUrl: './service-programme.component.scss'
})
export class ServiceProgrammeComponent implements OnInit {
    funeralService = inject(FuneralService);
    profileService = inject(ProfileService);
    private route = inject(ActivatedRoute);

    activeTab = signal<'funeral' | 'memorial'>('funeral');

    async ngOnInit(): Promise<void> {
        const provider = this.route.snapshot.paramMap.get('provider') ?? DEFAULT_PROVIDER;
        const funeralId = this.route.snapshot.paramMap.get('funeralId') ?? '';

        // Load profile branding and get the real UID (resolving slugs if needed)
        const uid = await this.profileService.loadProfile(provider);
        this.funeralService.loadFuneral(uid, funeralId);
    }

    showFuneralDetails(): void { this.activeTab.set('funeral'); }
    showMemorialDetails(): void { this.activeTab.set('memorial'); }

    get hasBothTabs(): boolean {
        return !!(this.funeralService.funeralData()?.memorial);
    }

    get showFuneral(): boolean {
        return !this.hasBothTabs || this.activeTab() === 'funeral';
    }

    get showMemorial(): boolean {
        return this.hasBothTabs && this.activeTab() === 'memorial';
    }

    get showFuneralStream(): boolean {
        const data = this.funeralService.funeralData();
        return !!(data?.streaming && !data?.memorial);
    }

    get showMemorialStream(): boolean {
        const data = this.funeralService.funeralData();
        return !!(data?.streaming && data?.memorial && this.activeTab() === 'memorial');
    }
}

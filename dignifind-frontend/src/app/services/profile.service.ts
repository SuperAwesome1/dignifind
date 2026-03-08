import { Injectable, signal, inject } from '@angular/core';
import { Database, ref, get } from '@angular/fire/database';
import { ProfileData, DEFAULT_TYPOGRAPHY } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private db = inject(Database);

    readonly profile = signal<ProfileData | null>(null);

    async loadProfile(providerId: string): Promise<void> {
        const profileRef = ref(this.db, `profiles/${providerId}`);
        const snap = await get(profileRef);
        const data: ProfileData = snap.exists() ? (snap.val() as ProfileData) : {};
        this.profile.set(data);
        this.applyBranding(data);
    }

    private applyBranding(data: ProfileData): void {
        const typo = data.typography ?? DEFAULT_TYPOGRAPHY;
        const root = document.documentElement;

        // Background
        if (data.backgroundUrl) {
            document.body.style.setProperty('--profile-bg-url', `url('${data.backgroundUrl}')`);
            document.body.classList.add('has-profile-bg');
        }

        // Typography CSS variables
        const tags = ['h1', 'h2', 'h3', 'h4', 'p'] as const;
        for (const tag of tags) {
            const style = typo[tag] as { fontFamily: string; color: string };
            root.style.setProperty(`--typo-${tag}-font`, style.fontFamily);
            root.style.setProperty(`--typo-${tag}-color`, style.color);
        }
        root.style.setProperty('--typo-hr-color', typo.hr.color);
    }
}

import { Injectable, signal, inject } from '@angular/core';
import { Database, ref, get } from '@angular/fire/database';
import { ProfileData, DEFAULT_TYPOGRAPHY } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private db = inject(Database);

    readonly profile = signal<ProfileData | null>(null);
    readonly resolvedProviderId = signal<string | null>(null);

    async loadProfile(providerId: string): Promise<string> {
        let uid = providerId;

        // Try to resolve slug if it's not a standard UID (Firebase UIDs are 28 chars)
        if (providerId.length < 20 || !/[0-9].*[a-zA-Z]|[a-zA-Z].*[0-9]/.test(providerId)) {
            const slugRef = ref(this.db, `slugs/${providerId.toLowerCase()}`);
            const slugSnap = await get(slugRef);
            if (slugSnap.exists()) {
                uid = slugSnap.val();
            }
        }

        this.resolvedProviderId.set(uid);
        const profileRef = ref(this.db, `profiles/${uid}`);
        const snap = await get(profileRef);
        const data: ProfileData = snap.exists() ? (snap.val() as ProfileData) : {};
        this.profile.set(data);
        this.applyBranding(data);
        return uid;
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

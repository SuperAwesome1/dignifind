import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Database, ref, get, set, update } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { filter, take } from 'rxjs/operators';

export interface TypographyStyle {
    fontFamily: string;
    color: string;
}

export interface SocialPages {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
}

export interface ProfileData {
    backgroundUrl?: string;
    logoUrl?: string;
    headerUrl?: string;
    backgroundPath?: string;
    logoPath?: string;
    headerPath?: string;
    contactNumber?: string;
    emergencyNumber?: string;
    whatsappNumber?: string;
    email?: string;
    socialPages?: SocialPages;
    typography?: {
        h1: TypographyStyle;
        h2: TypographyStyle;
        h3: TypographyStyle;
        h4: TypographyStyle;
        p: TypographyStyle;
        hr: { color: string };
    };
    slug?: string;
    location?: {
        name: string;
        url: string;
    };
    footerSettings?: {
        backgroundColor: string;
        fontColor: string;
    };
}

export const DEFAULT_TYPOGRAPHY: NonNullable<ProfileData['typography']> = {
    h1: { fontFamily: 'Inter', color: '#0d0f1a' },
    h2: { fontFamily: 'Inter', color: '#0d0f1a' },
    h3: { fontFamily: 'Inter', color: '#0d0f1a' },
    h4: { fontFamily: 'Inter', color: '#0d0f1a' },
    p: { fontFamily: 'Inter', color: '#3d4466' },
    hr: { color: '#e0e4f5' },
};

export const FONT_OPTIONS = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Georgia', 'Times New Roman',
    'Courier New', 'Dancing Script', 'Cinzel',
];

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private db = inject(Database);
    private authService = inject(AuthService);
    private injector = inject(Injector);

    private async getUid(): Promise<string> {
        const user = await this.authService.user$
            .pipe(filter(u => u !== null), take(1)).toPromise();
        return user!.uid;
    }

    async getProfile(): Promise<ProfileData> {
        const uid = await this.getUid();
        const profileRef = ref(this.db, `profiles/${uid}`);
        const snap = await runInInjectionContext(this.injector, () => get(profileRef));
        if (!snap.exists()) return {};
        return snap.val() as ProfileData;
    }

    async saveProfile(data: Partial<ProfileData>): Promise<void> {
        const uid = await this.getUid();
        const profileRef = ref(this.db, `profiles/${uid}`);

        if (data.slug) {
            const slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
            if (slug.length < 3) throw new Error('Handle must be at least 3 characters.');

            const slugRef = ref(this.db, `slugs/${slug}`);
            const slugSnap = await runInInjectionContext(this.injector, () => get(slugRef));

            if (slugSnap.exists() && slugSnap.val() !== uid) {
                throw new Error('This handle is already taken. Please choose another one.');
            }

            // Get current profile to check if slug changed
            const current = await this.getProfile();
            const updates: Record<string, any> = {};

            if (current.slug && current.slug.toLowerCase() !== slug) {
                updates[`slugs/${current.slug.toLowerCase()}`] = null;
            }
            updates[`slugs/${slug}`] = uid;
            updates[`profiles/${uid}/slug`] = slug;

            // Apply slug updates separately to avoid nesting issues with data
            await runInInjectionContext(this.injector, () => update(ref(this.db), updates));
            data.slug = slug;
        }

        return runInInjectionContext(this.injector, () => update(profileRef, data as object));
    }
}

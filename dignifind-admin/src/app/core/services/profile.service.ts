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
        return runInInjectionContext(this.injector, () => update(profileRef, data as object));
    }
}

import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Database, ref, update } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { Provider } from '../models/funeral.model';
import { filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProviderService {
    private db = inject(Database);
    private authService = inject(AuthService);
    private injector = inject(Injector);

    /** Save provider under providers/{uid} to satisfy security rule: auth.uid === $provider_id */
    async saveProvider(provider: Partial<Provider>): Promise<void> {
        const user = await this.authService.user$.pipe(
            filter(u => u !== null),
            take(1)
        ).toPromise();
        const uid = user!.uid;
        const providerRef = ref(this.db, `providers/${uid}`);
        return runInInjectionContext(this.injector, () =>
            update(providerRef, { ...provider, user: uid })
        );
    }
}

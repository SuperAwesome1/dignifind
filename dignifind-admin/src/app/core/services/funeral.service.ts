import { Injectable, inject, Injector, NgZone, runInInjectionContext } from '@angular/core';
import { Database, ref, get, update, remove, onValue, off } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { Funeral, GalleryImage } from '../models/funeral.model';
import { Observable, switchMap } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FuneralService {
    private db = inject(Database);
    private authService = inject(AuthService);
    private injector = inject(Injector);
    private ngZone = inject(NgZone);

    getMyFunerals(): Observable<Funeral[]> {
        return this.authService.user$.pipe(
            filter(user => user !== null),
            take(1),
            switchMap(user => new Observable<Funeral[]>(observer => {
                const funeralsRef = ref(this.db, `funerals/${user!.uid}`);
                const handler = runInInjectionContext(this.injector, () =>
                    onValue(funeralsRef, snapshot => {
                        this.ngZone.run(() => {
                            const funerals: Funeral[] = [];
                            snapshot.forEach(child => {
                                funerals.push({ id: child.key!, ...child.val() });
                            });
                            observer.next(funerals);
                        });
                    }, err => this.ngZone.run(() => observer.error(err)))
                );
                return () => off(funeralsRef, 'value', handler);
            }))
        );
    }

    getAllFunerals(): Observable<Funeral[]> {
        const funeralsRef = ref(this.db, 'funerals');
        return new Observable<Funeral[]>(observer => {
            const handler = runInInjectionContext(this.injector, () =>
                onValue(funeralsRef, snapshot => {
                    this.ngZone.run(() => {
                        const funerals: Funeral[] = [];
                        snapshot.forEach(userSnap => {
                            userSnap.forEach(funeralSnap => {
                                funerals.push({ id: funeralSnap.key!, ...funeralSnap.val() });
                            });
                        });
                        observer.next(funerals);
                    });
                }, err => this.ngZone.run(() => observer.error(err)))
            );
            return () => off(funeralsRef, 'value', handler);
        });
    }

    async getFuneral(id: string): Promise<Funeral | null> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const funeralRef = ref(this.db, `funerals/${user!.uid}/${id}`);
        const snap = await runInInjectionContext(this.injector, () => get(funeralRef));
        if (!snap.exists()) return null;
        return { id: snap.key!, ...snap.val() } as Funeral;
    }

    async saveFuneral(funeral: Partial<Funeral>): Promise<void> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const uid = user!.uid;

        // Generate shortId if missing
        if (!funeral.shortId) {
            funeral.shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        const funeralRef = ref(this.db, `funerals/${uid}/${funeral['graveNumber']}`);

        // Save to central lookup for /s/:shortId redirects
        const shortUpdate: Record<string, any> = {};
        shortUpdate[`shortlinks/${funeral.shortId}`] = { uid, id: funeral['graveNumber'] };
        await runInInjectionContext(this.injector, () => update(ref(this.db), shortUpdate));

        return runInInjectionContext(this.injector, () =>
            update(funeralRef, { ...funeral, user: uid })
        );
    }

    async graveNumberExists(graveNumber: string): Promise<boolean> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const funeralRef = ref(this.db, `funerals/${user!.uid}/${graveNumber}`);
        const snap = await runInInjectionContext(this.injector, () => get(funeralRef));
        return snap.exists();
    }

    async deleteFuneral(id: string): Promise<void> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const funeralRef = ref(this.db, `funerals/${user!.uid}/${id}`);
        return runInInjectionContext(this.injector, () => remove(funeralRef));
    }

    /** Save a gallery image entry under funerals/{uid}/{graveNumber}/gallery/{key} */
    async addGalleryImage(graveNumber: string, key: string, image: GalleryImage): Promise<void> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const galleryRef = ref(this.db, `funerals/${user!.uid}/${graveNumber}/gallery/${key}`);
        return runInInjectionContext(this.injector, () => update(galleryRef, image));
    }

    /** Remove a single gallery image entry from the database */
    async deleteGalleryImage(graveNumber: string, key: string): Promise<void> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const galleryRef = ref(this.db, `funerals/${user!.uid}/${graveNumber}/gallery/${key}`);
        return runInInjectionContext(this.injector, () => remove(galleryRef));
    }

    /** Remove the cover photo field */
    async deleteCoverPhoto(graveNumber: string): Promise<void> {
        const user = await this.authService.user$.pipe(filter(u => u !== null), take(1)).toPromise();
        const pictureRef = ref(this.db, `funerals/${user!.uid}/${graveNumber}/picture`);
        return runInInjectionContext(this.injector, () => remove(pictureRef));
    }
}

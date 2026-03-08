import { Injectable, signal, inject } from '@angular/core';
import { Database, ref, query, orderByKey, equalTo, get } from '@angular/fire/database';
import { FuneralData } from '../models/funeral.model';

@Injectable({ providedIn: 'root' })
export class FuneralService {
    private db = inject(Database);

    readonly funeralData = signal<FuneralData | null>(null);
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);

    loadFuneral(provider: string, funeralId: string): void {
        if (!provider || !funeralId) {
            this.error.set('No funeral ID provided in URL.');
            this.loading.set(false);
            return;
        }

        const funeralRef = ref(this.db, `funerals/${provider}`);
        const funeralQuery = query(funeralRef, orderByKey(), equalTo(funeralId));

        get(funeralQuery)
            .then((snapshot) => {
                let found = false;
                snapshot.forEach((child) => {
                    this.funeralData.set(child.val() as FuneralData);
                    found = true;
                });
                if (!found) {
                    this.error.set('Funeral not found.');
                }
                this.loading.set(false);
            })
            .catch((err) => {
                this.error.set('Failed to load funeral data.');
                this.loading.set(false);
                console.error(err);
            });
    }

    convertDate(epoch: number | string | undefined): string {
        if (!epoch) return '';
        if (isNaN(Number(epoch))) {
            return String(epoch);
        }
        const d = new Date(Number(epoch));
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    buildGoogleMapsEmbedUrl(lat: number | undefined, lng: number | undefined): string {
        if (!lat || !lng) return '';
        const location = `${lat},${lng}`;
        return `https://www.google.com/maps/embed/v1/place?zoom=15&key=AIzaSyBBkmORi786_fXlxb0jjBlielbo19d3s98&q=${location}`;
    }

    buildGoogleMapsDirectionsUrl(lat: number | undefined, lng: number | undefined): string {
        if (!lat || !lng) return '#';
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
}

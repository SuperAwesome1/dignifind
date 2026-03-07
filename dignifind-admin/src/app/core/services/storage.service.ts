import { Injectable, inject, Injector, NgZone, runInInjectionContext } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface UploadEvent {
    progress: number;       // 0-100
    downloadURL?: string;   // set only when complete
    storagePath?: string;   // set only when complete — needed to delete later
}

@Injectable({ providedIn: 'root' })
export class StorageService {
    private storage = inject(Storage);
    private injector = inject(Injector);
    private ngZone = inject(NgZone);

    uploadFuneralPicture(file: File): Observable<UploadEvent> {
        const path = `pictures/${Date.now()}-${file.name}`;
        return this._upload(path, file);
    }

    uploadGalleryImage(file: File): Observable<UploadEvent> {
        const path = `gallery/${Date.now()}-${file.name}`;
        return this._upload(path, file);
    }

    uploadProviderLogo(file: File): Observable<UploadEvent> {
        const path = `providers/${Date.now()}-${file.name}`;
        return this._upload(path, file);
    }

    uploadProfileBackground(file: File, uid: string): Observable<UploadEvent> {
        const path = `profiles/${uid}/background-${Date.now()}-${file.name}`;
        return this._upload(path, file);
    }

    uploadProfileLogo(file: File, uid: string): Observable<UploadEvent> {
        const path = `profiles/${uid}/logo-${Date.now()}-${file.name}`;
        return this._upload(path, file);
    }

    uploadProfileHeader(file: File, uid: string): Observable<UploadEvent> {
        const path = `profiles/${uid}/header-${Date.now()}-${file.name}`;
        return this._upload(path, file);
    }


    /** Delete a file from Firebase Storage by its storage path */
    deleteFile(storagePath: string): Promise<void> {
        return runInInjectionContext(this.injector, () =>
            deleteObject(ref(this.storage, storagePath))
        );
    }

    private _upload(path: string, file: File): Observable<UploadEvent> {
        return new Observable<UploadEvent>(observer => {
            const storageRef = ref(this.storage, path);
            const task = runInInjectionContext(this.injector, () =>
                uploadBytesResumable(storageRef, file, { contentType: file.type })
            );

            task.on('state_changed',
                snapshot => {
                    this.ngZone.run(() => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        observer.next({ progress });
                    });
                },
                err => this.ngZone.run(() => observer.error(err)),
                () => {
                    runInInjectionContext(this.injector, () =>
                        getDownloadURL(task.snapshot.ref)
                    ).then(url => {
                        this.ngZone.run(() => {
                            observer.next({ progress: 100, downloadURL: url, storagePath: path });
                            observer.complete();
                        });
                    }).catch(err => this.ngZone.run(() => observer.error(err)));
                }
            );
        });
    }
}

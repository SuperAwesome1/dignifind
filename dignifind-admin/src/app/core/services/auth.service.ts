import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import type { User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private injector = inject(Injector);
    user$: Observable<User | null> = user(this.auth);

    signInWithGoogle(): Promise<void> {
        return runInInjectionContext(this.injector, () =>
            signInWithPopup(this.auth, new GoogleAuthProvider()).then(() => undefined)
        );
    }

    signInWithEmail(email: string, password: string): Promise<void> {
        return runInInjectionContext(this.injector, () =>
            signInWithEmailAndPassword(this.auth, email, password).then(() => undefined)
        );
    }

    signOut(): Promise<void> {
        return runInInjectionContext(this.injector, () => signOut(this.auth));
    }

    get currentUid(): string | null {
        return this.auth.currentUser?.uid ?? null;
    }
}

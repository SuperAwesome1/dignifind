import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get } from '@angular/fire/database';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-short-redirect',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin-bottom: 20px;"></div>
        <p>Redirecting you to the service programme...</p>
    </div>
    <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `
})
export class ShortRedirectComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private db = inject(Database);

    async ngOnInit(): Promise<void> {
        const code = this.route.snapshot.paramMap.get('shortCode');
        if (!code) {
            this.router.navigate(['/']);
            return;
        }

        const shortId = code.toUpperCase();
        const shortRef = ref(this.db, `shortlinks/${shortId}`);
        const snap = await get(shortRef);

        if (snap.exists()) {
            const { uid, id } = snap.val();
            this.router.navigate([`/${uid}/${id}`]);
        } else {
            console.error('Short link not found');
            this.router.navigate(['/']);
        }
    }
}

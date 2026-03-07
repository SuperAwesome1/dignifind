import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly STORAGE_KEY = 'df-theme';

    theme = signal<Theme>(this.loadTheme());

    constructor() {
        // Apply theme to <html> whenever it changes
        effect(() => {
            const t = this.theme();
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem(this.STORAGE_KEY, t);
        });
    }

    toggle(): void {
        this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
    }

    private loadTheme(): Theme {
        const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
        if (saved === 'light' || saved === 'dark') return saved;
        // Respect OS preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
}

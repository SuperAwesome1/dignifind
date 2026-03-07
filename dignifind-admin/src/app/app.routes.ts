import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'funerals', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'funerals',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/funerals/funeral-list/funeral-list.component').then(m => m.FuneralListComponent),
    },
    {
        path: 'funerals/new',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/funerals/funeral-form/funeral-form.component').then(m => m.FuneralFormComponent),
    },
    {
        path: 'funerals/:id/edit',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/funerals/funeral-form/funeral-form.component').then(m => m.FuneralFormComponent),
    },
    {
        path: 'funerals/:id/pictures',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/funerals/funeral-pictures/funeral-pictures.component').then(m => m.FuneralPicturesComponent),
    },
    {
        path: 'funerals/:id/location',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/funerals/location/location.component').then(m => m.LocationComponent),
    },
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/profile/profile.component').then(m => m.ProfileComponent),
    },

    {
        path: 'search',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/search/search.component').then(m => m.SearchComponent),
    },
    {
        path: '**',
        loadComponent: () =>
            import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    },
];

import { Routes } from '@angular/router';
import { ServiceProgrammeComponent } from './pages/service-programme/service-programme.component';
import { ShortRedirectComponent } from './pages/short-redirect/short-redirect.component';

export const routes: Routes = [
    { path: 's/:shortCode', component: ShortRedirectComponent },
    { path: ':provider/:funeralId', component: ServiceProgrammeComponent },
    { path: '', component: ServiceProgrammeComponent },
    { path: '**', redirectTo: '' },
];

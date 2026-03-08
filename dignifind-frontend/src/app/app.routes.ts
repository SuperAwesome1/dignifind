import { Routes } from '@angular/router';
import { ServiceProgrammeComponent } from './pages/service-programme/service-programme.component';

export const routes: Routes = [
    { path: ':provider/:funeralId', component: ServiceProgrammeComponent },
    { path: '', component: ServiceProgrammeComponent },
    { path: '**', redirectTo: '' },
];

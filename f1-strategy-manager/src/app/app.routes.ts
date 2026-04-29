import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'season', loadComponent: () => import('./features/season/season.component').then(m => m.SeasonComponent) },
  { path: 'race', loadComponent: () => import('./features/race/race.component').then(m => m.RaceComponent) },
];

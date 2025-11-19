import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes').then(m => m.routes)
  },
  {
    path: 'mfe1',
    loadChildren: () => loadRemoteModule('mfe1', './routes').then(m => m.routes)
  }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { TaskDashboardComponent } from './components/task-dashboard/task-dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: TaskDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
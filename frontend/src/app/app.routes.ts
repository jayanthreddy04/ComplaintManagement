import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { NewComplaintComponent } from './components/new-complaint/new-complaint';
import { ProfileComponent } from './components/profile/profile';
import { StaffManagementComponent } from './components/admin/staff-management/staff-management';
import { authGuard } from './guards/auth-guard';
import { AdminLoginComponent } from './components/login/admin-login';

export const routes: Routes = [
  { path: '', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'new-complaint', component: NewComplaintComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin/staff', component: StaffManagementComponent, canActivate: [authGuard] },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: '**', redirectTo: '' }
];
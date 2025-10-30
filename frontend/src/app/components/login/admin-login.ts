import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="login-container admin-login-container">
      <div class="login-card admin-login-card">
        <h2>Admin Login</h2>
        <p>Admins, use your credentials to log in to the portal.</p>
        <form class="login-form" (ngSubmit)="onLogin()" *ngIf="!isLoading; else loading">
          <div class="form-group">
            <label for="email">Admin Email</label>
            <input type="email" id="email" [(ngModel)]="email" name="email" placeholder="Enter admin email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" [(ngModel)]="password" name="password" placeholder="Enter your password" required>
          </div>
          <button type="submit" class="login-btn admin-login-btn" [disabled]="!email || !password">Login</button>
          <div *ngIf="error" class="error-message">{{ error }}</div>
        </form>
        <ng-template #loading>
          <div class="loading">Logging in as Admin...</div>
        </ng-template>
        <div class="register-link">
          <p>Not an admin? <a routerLink="/login">Go to User Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-container { background: linear-gradient(135deg, #ff9800 0%, #f44336 100%); }
    .admin-login-card { border: 2px solid #f44336; }
    .admin-login-btn { background: #f44336; }
    .admin-login-btn:hover:not(:disabled) { background: #d32f2f; }
  `]
})
export class AdminLoginComponent {
  email = '';
  password = '';
  isLoading = false;
  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    this.isLoading = true;
    this.error = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (response.user.role !== 'admin') {
          this.error = 'Access denied. Not an admin user.';
          this.isLoading = false;
          this.authService.logout();
          return;
        }
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Login failed.';
        this.isLoading = false;
      }
    });
  }
}

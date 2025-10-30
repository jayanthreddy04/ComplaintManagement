import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>
        <p>Register with your college email</p>
        
        <form class="register-form" (ngSubmit)="onRegister()" *ngIf="!isLoading; else loading">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" [(ngModel)]="user.name" name="name" 
                   placeholder="Enter your full name" required>
          </div>

          <div class="form-group">
            <label for="email">College Email *</label>
            <input type="email" id="email" [(ngModel)]="user.email" name="email" 
                   placeholder="Enter your college email" required>
          </div>

          <div class="form-group">
            <label for="password">Password *</label>
            <input type="password" id="password" [(ngModel)]="user.password" name="password" 
                   placeholder="Create a password (min. 6 characters)" required minlength="6">
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input type="password" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" 
                   placeholder="Confirm your password" required (input)="checkPasswords()">
          </div>

          <div *ngIf="passwordError" class="error-message">
            {{ passwordError }}
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
          
          <button type="submit" class="register-btn" 
                  [disabled]="!isFormValid() || isLoading">
            {{ isLoading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <ng-template #loading>
          <div class="loading">Creating your account...</div>
        </ng-template>
        
        <div class="login-link">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 450px;
    }

    .register-card h2 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }

    .register-card p {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: bold;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .register-btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s ease;
      margin-top: 10px;
    }

    .register-btn:hover:not(:disabled) {
      background: #5a6fd8;
    }

    .register-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
      text-align: center;
      border: 1px solid #f5c6cb;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 16px;
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: bold;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: ''
  };
  
  confirmPassword: string = '';
  isLoading: boolean = false;
  error: string = '';
  passwordError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  checkPasswords() {
    if (this.user.password && this.confirmPassword && this.user.password !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
    } else {
      this.passwordError = '';
    }
  }

  isFormValid(): boolean {
    const basicValid = !!this.user.name && !!this.user.email && !!this.user.password && !!this.confirmPassword && this.user.password.length >= 6;
    return basicValid && this.user.password === this.confirmPassword;
  }

  onRegister() {
    if (!this.isFormValid()) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }
    this.isLoading = true;
    this.error = '';
    this.passwordError = '';
    // Prepare data for backend
    const registerData: any = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
      role: 'student' // always student
    };
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StudentDashboardComponent, StaffDashboardComponent, AdminDashboardComponent],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Complaint Portal Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{currentUser?.name}} ({{currentUser?.role}})</span>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </header>
      
      <nav class="dashboard-nav">
        <a routerLink="/dashboard" class="nav-link" [class.active]="true">Dashboard</a>
        <a routerLink="/new-complaint" class="nav-link" *ngIf="currentUser?.role === 'student'">New Complaint</a>
        <a routerLink="/profile" class="nav-link">Profile</a>
        <a routerLink="/admin/staff" class="nav-link" *ngIf="currentUser?.role === 'admin'">Manage Staff</a>
      </nav>

      <!-- Role-based dashboard -->
      <app-student-dashboard *ngIf="currentUser?.role === 'student'"></app-student-dashboard>
      <app-staff-dashboard *ngIf="currentUser?.role === 'staff'"></app-staff-dashboard>
      <app-admin-dashboard *ngIf="currentUser?.role === 'admin'"></app-admin-dashboard>
      
      <!-- Show message if user role is not recognized -->
      <div class="role-error" *ngIf="currentUser?.role !== 'student' && currentUser?.role !== 'staff' && currentUser?.role !== 'admin'">
        <div class="error-card">
          <h2>Access Restricted</h2>
          <p>Your user role ({{currentUser?.role}}) does not have access to this dashboard.</p>
          <p>Please contact administration for assistance.</p>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .dashboard-header {
      background: white;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .dashboard-header h1 {
      color: #333;
      margin: 0;
      font-size: 1.8rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .user-info span {
      color: #666;
      font-weight: 500;
      background: #f8f9fa;
      padding: 8px 15px;
      border-radius: 20px;
      border: 1px solid #e9ecef;
    }

    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .logout-btn:hover {
      background: #c82333;
      transform: translateY(-1px);
    }

    .dashboard-nav {
      background: #667eea;
      padding: 15px 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      transition: all 0.3s ease;
      font-weight: 500;
      border: 1px solid transparent;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.15);
      transform: translateY(-1px);
    }

    .nav-link.active {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .role-error {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 20px;
    }

    .error-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .error-card h2 {
      color: #dc3545;
      margin-bottom: 15px;
    }

    .error-card p {
      color: #666;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        text-align: center;
      }
      
      .user-info {
        justify-content: center;
      }
      
      .dashboard-nav {
        justify-content: center;
      }
      
      .nav-link {
        padding: 8px 15px;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-nav {
        flex-direction: column;
        align-items: center;
      }
      
      .nav-link {
        width: 200px;
        text-align: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // If no user is logged in, redirect to login
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
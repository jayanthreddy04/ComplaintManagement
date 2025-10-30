import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComplaintService, Complaint } from '../../../services/complaint.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="student-dashboard">
      <div class="dashboard-content">
        <h1>Student Dashboard</h1>
        
        <div class="stats-container" *ngIf="stats">
          <div class="stat-card">
            <h3>Total Complaints</h3>
            <p class="stat-number">{{ stats.total }}</p>
          </div>
          <div class="stat-card">
            <h3>Resolved</h3>
            <p class="stat-number resolved">{{ stats.resolved }}</p>
          </div>
          <div class="stat-card">
            <h3>In Progress</h3>
            <p class="stat-number in-progress">{{ stats.inProgress }}</p>
          </div>
          <div class="stat-card">
            <h3>Pending</h3>
            <p class="stat-number pending">{{ stats.pending }}</p>
          </div>
        </div>

        <div class="recent-complaints">
          <div class="section-header">
            <h2>Recent Complaints</h2>
            <button class="refresh-btn" (click)="loadComplaints()" [disabled]="loading">
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
          
          <div class="complaint-list" *ngIf="!loading; else loadingTemplate">
            <div *ngIf="complaints.length === 0" class="no-complaints">
              <p>No complaints submitted yet.</p>
              <button class="new-complaint-btn" routerLink="/new-complaint">
                Submit Your First Complaint
              </button>
            </div>
            
            <div class="complaint-item" *ngFor="let complaint of complaints">
              <div class="complaint-header">
                <span class="complaint-title">{{ complaint.title }}</span>
                <span class="status-badge" [class]="complaint.status">{{ complaint.status }}</span>
              </div>
              <div class="complaint-details">
                <span class="category">Category: {{ complaint.category }}</span>
                <span class="date">Submitted: {{ complaint.createdAt | date:'medium' }}</span>
              </div>
              <p class="complaint-description">{{ complaint.description }}</p>

              <!-- Work Proof Section -->
              <div class="work-proof-section" *ngIf="complaint.workProof && complaint.status === 'resolved'">
                <h4 class="work-proof-title">Work Proof Submitted by Staff</h4>
                <div class="work-proof-content">
                  <p class="work-proof-description">{{ complaint.workProof.description }}</p>
                  <div class="work-proof-files" *ngIf="complaint.workProof.files && complaint.workProof.files.length > 0">
                    <h5>Proof Files:</h5>
                    <ul class="file-list">
                      <li *ngFor="let file of complaint.workProof.files" class="file-item">
                        <a [href]="'http://localhost:3001/uploads/' + file" target="_blank" class="file-link">
                          📎 {{ file }}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div class="work-proof-meta">
                    <span class="work-proof-submitted-by">Submitted by: {{ complaint.workProof.submittedBy?.name }}</span>
                    <span class="work-proof-date">Date: {{ complaint.workProof.submittedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading">Loading complaints...</div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-dashboard {
      padding: 30px;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-content h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card h3 {
      color: #666;
      margin-bottom: 10px;
      font-size: 1rem;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0;
    }

    .stat-number:not(.resolved):not(.in-progress):not(.pending) {
      color: #667eea;
    }

    .stat-number.resolved {
      color: #28a745;
    }

    .stat-number.in-progress {
      color: #ffc107;
    }

    .stat-number.pending {
      color: #dc3545;
    }

    .recent-complaints {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      color: #333;
      margin: 0;
    }

    .refresh-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      background: #5a6fd8;
    }

    .refresh-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .complaint-item {
      padding: 20px;
      border-bottom: 1px solid #eee;
      transition: background 0.3s ease;
    }

    .complaint-item:hover {
      background: #f8f9fa;
    }

    .complaint-item:last-child {
      border-bottom: none;
    }

    .complaint-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .complaint-title {
      color: #333;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: capitalize;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.in-progress {
      background: #cce7ff;
      color: #004085;
    }

    .status-badge.resolved {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .complaint-details {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }

    .category, .date {
      color: #666;
    }

    .complaint-description {
      color: #555;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .work-proof-section {
      background: #f0f8f0;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
      margin-top: 15px;
    }

    .work-proof-title {
      color: #28a745;
      margin: 0 0 10px 0;
      font-size: 1.1rem;
    }

    .work-proof-content {
      color: #333;
    }

    .work-proof-description {
      margin: 0 0 10px 0;
      font-style: italic;
    }

    .work-proof-files h5 {
      margin: 10px 0 5px 0;
      color: #28a745;
    }

    .file-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .file-item {
      margin: 5px 0;
    }

    .file-link {
      color: #007bff;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .file-link:hover {
      text-decoration: underline;
    }

    .work-proof-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 0.9rem;
      color: #666;
    }

    .no-complaints {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .new-complaint-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 15px;
      transition: background 0.3s ease;
    }

    .new-complaint-btn:hover {
      background: #5a6fd8;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  complaints: Complaint[] = [];
  loading: boolean = false;
  stats: any = null;

  constructor(private complaintService: ComplaintService) {}

  ngOnInit() {
    this.loadComplaints();
    this.calculateStats();
  }

  loadComplaints() {
    this.loading = true;
    this.complaintService.getComplaints().subscribe({
      next: (response) => {
        this.complaints = response.complaints;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    const total = this.complaints.length;
    const resolved = this.complaints.filter(c => c.status === 'resolved').length;
    const inProgress = this.complaints.filter(c => c.status === 'in-progress').length;
    const pending = this.complaints.filter(c => c.status === 'pending').length;

    this.stats = { total, resolved, inProgress, pending };
  }
}
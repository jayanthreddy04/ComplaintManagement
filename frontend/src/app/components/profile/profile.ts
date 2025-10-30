import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, ProfileUser } from '../../services/user.service';
import { ComplaintService, Complaint } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <!-- Header with Back Button -->
        <div class="profile-header">
          <button class="back-btn" routerLink="/dashboard">← Back to Dashboard</button>
          <h2>User Profile</h2>
          <div class="header-spacer"></div>
        </div>
        
        <!-- Profile Information -->
        <div class="profile-section" *ngIf="user; else loadingUser">
          <h3 class="section-title">Personal Information</h3>
          <div class="profile-info">
            <div class="info-group">
              <label>Full Name:</label>
              <span class="info-value">{{ user.name }}</span>
            </div>
            <div class="info-group">
              <label>Email:</label>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-group">
              <label>Role:</label>
              <span class="info-value role-badge">{{ user.role }}</span>
            </div>
            <div class="info-group" *ngIf="user.department">
              <label>Department:</label>
              <span class="info-value">{{ user.department }}</span>
            </div>
            <div class="info-group">
              <label>Member Since:</label>
              <span class="info-value">{{ user.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <!-- Edit Profile Section -->
        <div class="profile-section">
          <h3 class="section-title">Edit Profile</h3>
          <form class="edit-form" (ngSubmit)="onUpdateProfile()">
            <div class="form-row">
              <div class="form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" [(ngModel)]="editUser.name" name="name" class="form-input">
              </div>
              <div class="form-group" *ngIf="user?.role === 'staff'">
                <label for="editDepartment">Department</label>
                <input type="text" id="editDepartment" [(ngModel)]="editUser.department" name="department" class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label for="editPassword">New Password</label>
              <input type="password" id="editPassword" [(ngModel)]="editUser.password" name="password" 
                     placeholder="Enter new password (leave blank to keep current)" class="form-input">
            </div>
            <button type="submit" class="update-btn" [disabled]="isUpdating">
              {{ isUpdating ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>

        <!-- Feedback Section - Only for Students -->
        <div class="profile-section" *ngIf="user?.role === 'student'">
          <h3 class="section-title">Provide Feedback</h3>
          <div class="feedback-form">
            <div class="form-group">
              <label for="feedbackComplaint">Select Complaint</label>
              <select id="feedbackComplaint" [(ngModel)]="selectedComplaintId" class="form-input">
                <option value="">Select a resolved complaint</option>
                <option *ngFor="let complaint of resolvedComplaints" [value]="complaint._id">
                  {{ complaint.title }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Rating</label>
              <div class="rating-stars">
                <span *ngFor="let star of [1,2,3,4,5]" 
                      (click)="setRating(star)"
                      class="star"
                      [class.active]="star <= feedback.rating">★</span>
              </div>
            </div>
            <div class="form-group">
              <label for="feedbackComment">Comments</label>
              <textarea id="feedbackComment" [(ngModel)]="feedback.comment" 
                        placeholder="Share your experience..." 
                        class="form-input textarea"></textarea>
            </div>
            <button class="submit-feedback-btn" (click)="submitFeedback()" [disabled]="!canSubmitFeedback()">
              Submit Feedback
            </button>
          </div>
        </div>

        <!-- Work Proof Section - Only for Staff -->
        <div class="profile-section" *ngIf="user?.role === 'staff'">
          <h3 class="section-title">Work Proof Management</h3>
          <div class="work-proof-info">
            <p>As a staff member, you can upload work proof when resolving complaints assigned to you.</p>
            <p>This helps demonstrate the work done to resolve student complaints.</p>
            <div class="work-proof-stats">
              <div class="stat-item">
                <span class="stat-number">{{ assignedComplaints.length }}</span>
                <span class="stat-label">Assigned Complaints</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ resolvedComplaints.length }}</span>
                <span class="stat-label">Resolved Complaints</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Complaints History -->
        <div class="profile-section">
          <h3 class="section-title">Complaints History</h3>
          <div class="complaints-history" *ngIf="!loadingComplaints; else loadingComplaintsTemplate">
            <div *ngIf="complaints.length === 0" class="no-complaints">
              <p *ngIf="user?.role === 'student'">No complaints submitted yet.</p>
              <p *ngIf="user?.role === 'staff'">No complaints assigned to you yet.</p>
              <p *ngIf="user?.role === 'admin'">No complaints in the system yet.</p>
              <button class="new-complaint-btn" routerLink="/new-complaint" *ngIf="user?.role === 'student'">Submit Your First Complaint</button>
            </div>
            
            <div *ngFor="let complaint of complaints" class="complaint-card">
              <div class="complaint-header">
                <div class="complaint-main">
                  <h4 class="complaint-title">{{ complaint.title }}</h4>
                  <span class="complaint-category">{{ complaint.category }}</span>
                </div>
                <span class="status-badge" [class]="complaint.status">{{ complaint.status }}</span>
              </div>
              <p class="complaint-description">{{ complaint.description }}</p>
              <div class="complaint-footer">
                <span class="complaint-date">Submitted: {{ complaint.createdAt | date:'medium' }}</span>
                <span class="complaint-id">ID: #{{ complaint._id?.substring(18) }}</span>
              </div>
              <div class="complaint-feedback" *ngIf="complaint.feedback">
                <strong *ngIf="user?.role === 'student'">Your Feedback:</strong>
                <strong *ngIf="user?.role !== 'student'">Student Feedback by {{ complaint.createdBy?.name }} ({{ complaint.createdBy?.email }})</strong>
                <div class="feedback-rating">
                  Rating: {{ complaint.feedback.rating }}/5
                </div>
                <div class="feedback-comment" *ngIf="complaint.feedback.comment">
                  Comment: {{ complaint.feedback.comment }}
                </div>
              </div>
            </div>
          </div>

          <ng-template #loadingComplaintsTemplate>
            <div class="loading">Loading complaints...</div>
          </ng-template>
        </div>

        <ng-template #loadingUser>
          <div class="loading">Loading profile...</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .profile-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
      max-width: 900px;
      margin: 0 auto;
    }

    .profile-header {
      background: #667eea;
      color: white;
      padding: 25px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .back-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: rgba(255,255,255,0.3);
      transform: translateX(-5px);
    }

    .profile-header h2 {
      margin: 0;
      font-size: 1.8rem;
    }

    .header-spacer {
      width: 100px;
    }

    .profile-section {
      padding: 30px;
      border-bottom: 1px solid #eee;
    }

    .profile-section:last-child {
      border-bottom: none;
    }

    .section-title {
      color: #333;
      margin-bottom: 25px;
      font-size: 1.4rem;
      border-left: 4px solid #667eea;
      padding-left: 15px;
    }

    .profile-info {
      display: grid;
      gap: 15px;
    }

    .info-group {
      display: flex;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .info-group:hover {
      background: #e9ecef;
      transform: translateX(5px);
    }

    .info-group label {
      font-weight: 600;
      color: #495057;
      min-width: 120px;
      margin: 0;
    }

    .info-value {
      color: #333;
      font-weight: 500;
    }

    .role-badge {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      text-transform: capitalize;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 600;
    }

    .form-input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .textarea {
      resize: vertical;
      min-height: 100px;
      font-family: inherit;
    }

    .update-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .update-btn:hover:not(:disabled) {
      background: #218838;
      transform: translateY(-2px);
    }

    .update-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .feedback-form {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
    }

    .rating-stars {
      display: flex;
      gap: 5px;
    }

    .star {
      font-size: 2rem;
      color: #ddd;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .star:hover,
    .star.active {
      color: #ffc107;
      transform: scale(1.2);
    }

    .submit-feedback-btn {
      background: #17a2b8;
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .submit-feedback-btn:hover:not(:disabled) {
      background: #138496;
      transform: translateY(-2px);
    }

    .submit-feedback-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .work-proof-info {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
      border-left: 4px solid #28a745;
    }

    .work-proof-info p {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .work-proof-stats {
      display: flex;
      gap: 30px;
      margin-top: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #28a745;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .complaints-history {
      display: grid;
      gap: 20px;
    }

    .complaint-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .complaint-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }

    .complaint-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .complaint-main h4 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .complaint-category {
      background: #6c757d;
      color: white;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      text-transform: capitalize;
    }

    .status-badge {
      padding: 6px 15px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
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

    .complaint-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .complaint-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 10px;
    }

    .complaint-feedback {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #17a2b8;
    }

    .feedback-rating {
      color: #ffc107;
      font-weight: 600;
      margin: 5px 0;
    }

    .feedback-comment {
      color: #495057;
      font-style: italic;
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
      font-weight: 600;
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
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .profile-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }
      
      .header-spacer {
        display: none;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: ProfileUser | null = null;
  editUser: any = {};
  complaints: Complaint[] = [];
  resolvedComplaints: Complaint[] = [];
  assignedComplaints: Complaint[] = [];
  loadingComplaints: boolean = false;
  isUpdating: boolean = false;
  
  feedback = {
    rating: 0,
    comment: ''
  };

  selectedComplaintId: string | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private complaintService: ComplaintService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadComplaints();
  }

  loadUserProfile() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.editUser = { ...user, password: '' };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadComplaints() {
    this.loadingComplaints = true;
    this.complaintService.getComplaints().subscribe({
      next: (response) => {
        this.complaints = response.complaints;
        this.resolvedComplaints = this.complaints.filter(c => c.status === 'resolved');
        this.assignedComplaints = this.complaints.filter(c => c.assignedTo);
        this.loadingComplaints = false;
      },
      error: (error) => {
        console.error('Error loading complaints:', error);
        this.loadingComplaints = false;
      }
    });
  }

  onUpdateProfile() {
    this.isUpdating = true;

    const updateData: any = {};
    if (this.editUser.name && this.editUser.name !== this.user?.name) {
      updateData.name = this.editUser.name;
    }
    if (this.editUser.department && this.editUser.department !== this.user?.department) {
      updateData.department = this.editUser.department;
    }

    this.userService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.user = response.user;
        this.editUser.password = '';
        this.isUpdating = false;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isUpdating = false;
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  setRating(rating: number) {
    this.feedback.rating = rating;
  }

  canSubmitFeedback(): boolean {
    return !!this.selectedComplaintId && this.feedback.rating > 0;
  }

  submitFeedback() {
    if (!this.canSubmitFeedback() || !this.selectedComplaintId) {
      alert('Please select a complaint and provide a rating.');
      return;
    }

    this.complaintService.submitFeedback(this.selectedComplaintId, this.feedback).subscribe({
      next: (response) => {
        alert('Thank you for your feedback!');
        this.feedback = { rating: 0, comment: '' };
        this.selectedComplaintId = null;
        this.loadComplaints(); // Reload to show the feedback
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
      }
    });
  }
}
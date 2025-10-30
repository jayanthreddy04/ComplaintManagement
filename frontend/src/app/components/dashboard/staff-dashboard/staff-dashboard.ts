import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService, Complaint } from '../../../services/complaint.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="staff-dashboard">
      <div class="dashboard-content">
        <h1>Staff Dashboard</h1>
        
        <div class="stats-container" *ngIf="stats">
          <div class="stat-card">
            <h3>Pending Complaints</h3>
            <p class="stat-number pending">{{ stats.pending }}</p>
          </div>
          <div class="stat-card">
            <h3>Assigned to Me</h3>
            <p class="stat-number assigned">{{ stats.assigned }}</p>
          </div>
          <div class="stat-card">
            <h3>In Progress</h3>
            <p class="stat-number in-progress">{{ stats.inProgress }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Resolved</h3>
            <p class="stat-number resolved">{{ stats.resolved }}</p>
          </div>
        </div>

        <div class="complaints-section">
          <div class="section-header">
            <h2>Recent Complaints</h2>
            <div class="filter-controls">
              <select [(ngModel)]="selectedStatus" (change)="loadComplaints()">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <button class="refresh-btn" (click)="loadComplaints()" [disabled]="loading">
                {{ loading ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>

          <div class="complaint-list" *ngIf="!loading; else loadingTemplate">
            <div *ngIf="complaints.length === 0" class="no-complaints">
              <p>No complaints found.</p>
            </div>
            
            <div class="complaint-item" *ngFor="let complaint of complaints">
              <div class="complaint-info">
                <div class="complaint-main">
                  <h4 class="complaint-title">{{ complaint.title }}</h4>
                  <div class="complaint-meta">
                    <span class="student">By: {{ complaint.createdBy?.name || 'Unknown' }}</span>
                    <span class="category">Category: {{ complaint.category }}</span>
                    <span class="date">Submitted: {{ complaint.createdAt | date:'short' }}</span>
                  </div>
                </div>
                <div class="complaint-actions">
                  <span class="status-badge" [class]="complaint.status">{{ complaint.status }}</span>
                  <div class="action-buttons" *ngIf="complaint.status !== 'resolved'">
                    <select [(ngModel)]="complaint.newStatus" (change)="updateStatus(complaint)">
                      <option value="">Update Status</option>
                      <option value="in-progress">Mark In Progress</option>
                      <option value="resolved">Mark Resolved</option>
                    </select>
                    <button class="work-proof-btn" (click)="showWorkProofModal(complaint)" *ngIf="complaint.status === 'in-progress'">
                      Upload Work Proof
                    </button>
                  </div>
                </div>
              </div>
              <p class="complaint-description">{{ complaint.description }}</p>

              <!-- Work Proof Section -->
              <div class="work-proof-section" *ngIf="complaint.workProof && complaint.status === 'resolved'">
                <h4 class="work-proof-title">Work Proof Submitted</h4>
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
              
              <div class="complaint-feedback" *ngIf="complaint.feedback">
                <strong>Student Feedback:</strong>
                <div class="feedback-student-info">
                  <span class="student-name">By: {{ complaint.createdBy?.name }}</span>
                  <span class="student-email">({{ complaint.createdBy?.email }})</span>
                </div>
                <div class="feedback-rating">
                  Rating: <span class="stars">{{ getStars(complaint.feedback.rating) }}</span>
                </div>
                <div class="feedback-comment" *ngIf="complaint.feedback.comment">
                  "{{ complaint.feedback.comment }}"
                </div>
                <div class="feedback-date">
                  Submitted: {{ complaint.feedback.submittedAt | date:'medium' }}
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

    <!-- Work Proof Modal -->
    <div class="modal" *ngIf="selectedComplaintForProof" (click)="closeWorkProofModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Upload Work Proof</h3>
          <button class="close-btn" (click)="closeWorkProofModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="work-proof-form">
            <div class="form-group">
              <label for="workDescription">Work Description:</label>
              <textarea id="workDescription" [(ngModel)]="workProofDescription" 
                       placeholder="Describe the work done to resolve this complaint..." 
                       rows="4"></textarea>
            </div>
            <div class="form-group">
              <label for="workFiles">Upload Proof Files:</label>
              <input type="file" id="workFiles" (change)="onWorkProofFileSelected($event)" 
                     accept="image/*,video/*,.pdf" multiple>
              <small>Upload images, videos, or PDFs showing the work done (Max 5MB per file)</small>
            </div>
            <div class="selected-work-files" *ngIf="workProofFiles.length > 0">
              <h4>Selected Files ({{ workProofFiles.length }}):</h4>
              <ul>
                <li *ngFor="let file of workProofFiles; let i = index">
                  {{ file.name }} ({{ getFileSize(file.size) }})
                  <button type="button" class="remove-file" (click)="removeWorkProofFile(i)">×</button>
                </li>
              </ul>
            </div>
            <div *ngIf="workProofError" class="error-message">
              {{ workProofError }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" (click)="submitWorkProof()" [disabled]="!workProofDescription">
            Submit Work Proof
          </button>
          <button class="btn btn-secondary" (click)="closeWorkProofModal()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .staff-dashboard {
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

    .stat-number.pending {
      color: #dc3545;
    }

    .stat-number.assigned {
      color: #667eea;
    }

    .stat-number.in-progress {
      color: #ffc107;
    }

    .stat-number.resolved {
      color: #28a745;
    }

    .complaints-section {
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
      flex-wrap: wrap;
      gap: 15px;
    }

    .section-header h2 {
      color: #333;
      margin: 0;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .filter-controls select {
      padding: 8px 12px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .filter-controls select:focus {
      outline: none;
      border-color: #667eea;
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

    .complaint-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
      gap: 20px;
    }

    .complaint-main h4 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 1.1rem;
    }

    .complaint-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 0.9rem;
    }

    .student, .category, .date {
      color: #666;
    }

    .complaint-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      min-width: 150px;
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

    .action-buttons select {
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.8rem;
      background: white;
      transition: border-color 0.3s ease;
    }

    .action-buttons select:focus {
      outline: none;
      border-color: #667eea;
    }

    .work-proof-btn {
      padding: 6px 10px;
      border: 1px solid #28a745;
      border-radius: 4px;
      font-size: 0.8rem;
      background: #28a745;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 5px;
    }

    .work-proof-btn:hover {
      background: #218838;
      border-color: #1e7e34;
    }

    .complaint-description {
      color: #555;
      line-height: 1.5;
      margin-bottom: 15px;
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

    .complaint-feedback {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #17a2b8;
    }

    .feedback-student-info {
      margin-bottom: 10px;
      font-size: 0.9rem;
      color: #666;
    }

    .student-name {
      font-weight: 600;
      color: #17a2b8;
    }

    .student-email {
      color: #666;
      margin-left: 5px;
    }

    .feedback-date {
      margin-top: 8px;
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }

    .feedback-rating {
      color: #ffc107;
      font-weight: 600;
      margin: 5px 0;
    }

    .stars {
      color: #ffc107;
    }

    .feedback-comment {
      color: #495057;
      font-style: italic;
      margin-top: 5px;
    }

    .no-complaints {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 10px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      padding: 20px;
    }

    .work-proof-form .form-group {
      margin-bottom: 20px;
    }

    .work-proof-form label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }

    .work-proof-form textarea,
    .work-proof-form input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .work-proof-form textarea:focus,
    .work-proof-form input:focus {
      outline: none;
      border-color: #667eea;
    }

    .selected-work-files {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
      border: 1px solid #e9ecef;
    }

    .selected-work-files h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1rem;
    }

    .selected-work-files ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .selected-work-files li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
      color: #666;
    }

    .selected-work-files li:last-child {
      border-bottom: none;
    }

    .remove-file {
      background: #dc3545;
      color: white;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-file:hover {
      background: #c82333;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .complaint-info {
        flex-direction: column;
        align-items: stretch;
      }
      
      .complaint-actions {
        align-items: stretch;
        flex-direction: row;
        justify-content: space-between;
      }
      
      .section-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-controls {
        justify-content: space-between;
      }
    }
  `]
})
export class StaffDashboardComponent implements OnInit {
  complaints: (Complaint & { newStatus?: string })[] = [];
  loading: boolean = false;
  selectedStatus: string = '';
  stats: any = null;
  
  // Work proof properties
  selectedComplaintForProof: Complaint | null = null;
  workProofDescription: string = '';
  workProofFiles: File[] = [];
  workProofError: string = '';

  constructor(
    private complaintService: ComplaintService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.loading = true;
    
    const filters: any = {};
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    this.complaintService.getComplaints(filters).subscribe({
      next: (response) => {
        this.complaints = response.complaints.map(complaint => ({
          ...complaint,
          newStatus: ''
        }));
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
    const pending = this.complaints.filter(c => c.status === 'pending').length;
    const assigned = this.complaints.filter(c => c.assignedTo).length;
    const inProgress = this.complaints.filter(c => c.status === 'in-progress').length;
    const resolved = this.complaints.filter(c => c.status === 'resolved').length;

    this.stats = { total, pending, assigned, inProgress, resolved };
  }

  updateStatus(complaint: Complaint & { newStatus?: string }) {
    if (!complaint.newStatus || !complaint._id) return;

    // If marking as resolved, ask for proof submission
    if (complaint.newStatus === 'resolved') {
      const hasProof = complaint.workProof && complaint.workProof.description;
      if (!hasProof) {
        const submitProof = confirm('To mark this complaint as resolved, you should submit work proof. Would you like to submit proof now?');
        if (submitProof) {
          this.showWorkProofModal(complaint);
          return;
        } else {
          const proceed = confirm('Are you sure you want to mark as resolved without submitting proof?');
          if (!proceed) {
            complaint.newStatus = '';
            return;
          }
        }
      }
    }

    this.complaintService.updateComplaintStatus(complaint._id, complaint.newStatus).subscribe({
      next: (updatedComplaint) => {
        // Update the local complaint
        const index = this.complaints.findIndex(c => c._id === complaint._id);
        if (index !== -1) {
          this.complaints[index] = { ...updatedComplaint, newStatus: '' };
        }
        this.calculateStats();
        alert('Complaint status updated successfully!');
      },
      error: (error) => {
        console.error('Error updating complaint status:', error);
        alert('Failed to update complaint status. Please try again.');
      }
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  // Work proof methods
  showWorkProofModal(complaint: Complaint) {
    this.selectedComplaintForProof = complaint;
    this.workProofDescription = '';
    this.workProofFiles = [];
    this.workProofError = '';
  }

  closeWorkProofModal() {
    this.selectedComplaintForProof = null;
    this.workProofDescription = '';
    this.workProofFiles = [];
    this.workProofError = '';
  }

  onWorkProofFileSelected(event: any) {
    const files: FileList = event.target.files;
    const fileArray: File[] = Array.from(files);
    
    // Filter files by size (5MB limit)
    const validFiles = fileArray.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== fileArray.length) {
      this.workProofError = 'Some files were too large (max 5MB per file).';
    }
    
    this.workProofFiles = [...this.workProofFiles, ...validFiles];
    event.target.value = ''; // Reset file input
  }

  removeWorkProofFile(index: number) {
    this.workProofFiles.splice(index, 1);
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  submitWorkProof() {
    if (!this.selectedComplaintForProof || !this.workProofDescription) {
      this.workProofError = 'Please provide work description.';
      return;
    }

    const formData = new FormData();
    formData.append('description', this.workProofDescription);
    
    // Append files
    this.workProofFiles.forEach(file => {
      formData.append('workProofFiles', file);
    });

    this.complaintService.submitWorkProof(this.selectedComplaintForProof._id!, formData).subscribe({
      next: (response) => {
        alert('Work proof submitted successfully!');
        this.closeWorkProofModal();
        this.loadComplaints(); // Reload complaints to show updated data
      },
      error: (error) => {
        console.error('Error submitting work proof:', error);
        this.workProofError = 'Failed to submit work proof. Please try again.';
      }
    });
  }
}
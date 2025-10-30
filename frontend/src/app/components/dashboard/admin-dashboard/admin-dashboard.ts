import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ComplaintService, Complaint } from '../../../services/complaint.service';

interface AdminStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  categoryStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
}

interface Staff {
  _id: string;
  name: string;
  email: string;
  department: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-dashboard">
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{stats?.totalComplaints || 0}}</h3>
            <p>Total Complaints</p>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{stats?.pendingComplaints || 0}}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">🔄</div>
          <div class="stat-content">
            <h3>{{stats?.inProgressComplaints || 0}}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div class="stat-card resolved">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{stats?.resolvedComplaints || 0}}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="selectedStatus" (change)="loadComplaints()">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Category:</label>
          <select [(ngModel)]="selectedCategory" (change)="loadComplaints()">
            <option value="">All</option>
            <option value="hostel">Hostel</option>
            <option value="mess">Mess</option>
            <option value="college">College</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search:</label>
          <input type="text" [(ngModel)]="searchTerm" (input)="onSearchChange()" placeholder="Search complaints...">
        </div>
      </div>

      <!-- Complaints Table -->
      <div class="complaints-section">
        <h2>Complaints Management</h2>
        <div class="table-container">
          <table class="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created By</th>
                <th>Assigned To</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let complaint of complaints">
                <td>{{complaint._id?.substring(0, 8)}}</td>
                <td class="title-cell">{{complaint.title}}</td>
                <td>
                  <span class="category-badge" [class]="'category-' + complaint.category">
                    {{complaint.category}}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="'status-' + complaint.status">
                    {{complaint.status}}
                  </span>
                </td>
                <td>
                  <span class="priority-badge" [class]="'priority-' + complaint.priority">
                    {{complaint.priority}}
                  </span>
                </td>
                <td>{{complaint.createdBy?.name}}</td>
                <td>{{complaint.assignedTo?.name || 'Unassigned'}}</td>
                <td>{{complaint.createdAt | date:'short'}}</td>
                <td>
                  <button class="action-btn view" (click)="viewComplaint(complaint)">View</button>
                  <button class="action-btn assign" (click)="assignComplaint(complaint)">Assign</button>
                  <button class="action-btn delete" (click)="deleteComplaint(complaint)" *ngIf="complaint.status === 'resolved'">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="previousPage()" [disabled]="currentPage === 1">Previous</button>
          <span>Page {{currentPage}} of {{totalPages}}</span>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
        </div>
      </div>

      <!-- Complaint Details Modal -->
      <div class="modal" *ngIf="selectedComplaint" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Complaint Details</h3>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="complaint-details">
              <div class="detail-row">
                <label>Title:</label>
                <span>{{selectedComplaint.title}}</span>
              </div>
              <div class="detail-row">
                <label>Description:</label>
                <p>{{selectedComplaint.description}}</p>
              </div>
              <div class="detail-row">
                <label>Category:</label>
                <span class="category-badge" [class]="'category-' + selectedComplaint.category">
                  {{selectedComplaint.category}}
                </span>
              </div>
              <div class="detail-row">
                <label>Status:</label>
                <select [(ngModel)]="selectedComplaint.status" (change)="updateComplaintStatus()">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div class="detail-row">
                <label>Priority:</label>
                <select [(ngModel)]="selectedComplaint.priority" (change)="updateComplaintStatus()">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div class="detail-row">
                <label>Created By:</label>
                <span>{{selectedComplaint.createdBy?.name}} ({{selectedComplaint.createdBy?.email}})</span>
              </div>
              <div class="detail-row">
                <label>Assigned To:</label>
                <select [(ngModel)]="selectedComplaint.assignedTo" (change)="assignStaff()">
                  <option value="">Unassigned</option>
                  <option *ngFor="let staff of staffMembers" [value]="staff._id">
                    {{staff.name}} ({{staff.department}})
                  </option>
                </select>
              </div>
              <div class="detail-row">
                <label>Admin Notes:</label>
                <textarea [(ngModel)]="selectedComplaint.adminNotes" 
                         placeholder="Add admin notes..." 
                         rows="3"></textarea>
              </div>
              <div class="detail-row" *ngIf="selectedComplaint.proofImage">
                <label>Proof Image:</label>
                <img [src]="'http://localhost:3001/uploads/' + selectedComplaint.proofImage" 
                     alt="Proof" class="proof-image">
              </div>

              <!-- Work Proof Section -->
              <div class="work-proof-section" *ngIf="selectedComplaint.workProof">
                <h4 class="work-proof-title">Work Proof Submitted by Staff</h4>
                <div class="work-proof-content">
                  <div class="detail-row">
                    <label>Work Description:</label>
                    <p class="work-proof-description">{{ selectedComplaint.workProof.description }}</p>
                  </div>
                  <div class="detail-row" *ngIf="selectedComplaint.workProof.files && selectedComplaint.workProof.files.length > 0">
                    <label>Proof Files:</label>
                    <ul class="file-list">
                      <li *ngFor="let file of selectedComplaint.workProof.files" class="file-item">
                        <a [href]="'http://localhost:3001/uploads/' + file" target="_blank" class="file-link">
                          📎 {{ file }}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div class="detail-row">
                    <label>Submitted by:</label>
                    <span>{{ selectedComplaint.workProof.submittedBy?.name }} ({{ selectedComplaint.workProof.submittedBy?.email }})</span>
                  </div>
                  <div class="detail-row">
                    <label>Submitted on:</label>
                    <span>{{ selectedComplaint.workProof.submittedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>

              <!-- Student Feedback Section -->
              <div class="feedback-section" *ngIf="selectedComplaint.feedback">
                <h4 class="feedback-title">Student Feedback</h4>
                <div class="feedback-content">
                  <div class="detail-row">
                    <label>Student:</label>
                    <span class="student-info">
                      {{ selectedComplaint.createdBy?.name }} ({{ selectedComplaint.createdBy?.email }})
                    </span>
                  </div>
                  <div class="detail-row">
                    <label>Rating:</label>
                    <div class="feedback-rating">
                      <span class="stars">{{ getStars(selectedComplaint.feedback.rating) }}</span>
                      <span class="rating-text">{{ selectedComplaint.feedback.rating }}/5</span>
                    </div>
                  </div>
                  <div class="detail-row" *ngIf="selectedComplaint.feedback.comment">
                    <label>Comment:</label>
                    <p class="feedback-comment">"{{ selectedComplaint.feedback.comment }}"</p>
                  </div>
                  <div class="detail-row">
                    <label>Submitted on:</label>
                    <span>{{ selectedComplaint.feedback.submittedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="saveChanges()">Save Changes</button>
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-card.pending { border-left: 4px solid #ffc107; }
    .stat-card.in-progress { border-left: 4px solid #17a2b8; }
    .stat-card.resolved { border-left: 4px solid #28a745; }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .stat-content p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .filters-section {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-weight: 500;
      color: #333;
    }

    .filter-group select,
    .filter-group input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .complaints-section {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .complaints-section h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .table-container {
      overflow-x: auto;
    }

    .complaints-table {
      width: 100%;
      border-collapse: collapse;
    }

    .complaints-table th,
    .complaints-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .complaints-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .title-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .category-badge,
    .status-badge,
    .priority-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .category-hostel { background: #e3f2fd; color: #1976d2; }
    .category-mess { background: #f3e5f5; color: #7b1fa2; }
    .category-college { background: #e8f5e8; color: #388e3c; }
    .category-academic { background: #fff3e0; color: #f57c00; }
    .category-administrative { background: #fce4ec; color: #c2185b; }
    .category-other { background: #f5f5f5; color: #616161; }

    .status-pending { background: #fff3cd; color: #856404; }
    .status-in-progress { background: #d1ecf1; color: #0c5460; }
    .status-resolved { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }

    .priority-low { background: #d4edda; color: #155724; }
    .priority-medium { background: #fff3cd; color: #856404; }
    .priority-high { background: #f8d7da; color: #721c24; }

    .action-btn {
      padding: 6px 12px;
      margin: 2px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.3s ease;
    }

    .action-btn.view {
      background: #17a2b8;
      color: white;
    }

    .action-btn.assign {
      background: #28a745;
      color: white;
    }

    .action-btn.delete {
      background: #dc3545;
      color: white;
    }

    .action-btn:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 20px;
    }

    .pagination button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 5px;
      cursor: pointer;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

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
      max-width: 600px;
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

    .complaint-details {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .detail-row label {
      font-weight: 600;
      color: #333;
    }

    .detail-row select,
    .detail-row textarea {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .proof-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .work-proof-section {
      background: #f0f8f0;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
      margin-top: 20px;
    }

    .work-proof-title {
      color: #28a745;
      margin: 0 0 15px 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .work-proof-content {
      color: #333;
    }

    .work-proof-description {
      margin: 0 0 15px 0;
      font-style: italic;
      background: white;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #e9ecef;
    }

    .file-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .file-item {
      margin: 8px 0;
      padding: 8px;
      background: white;
      border-radius: 5px;
      border: 1px solid #e9ecef;
    }

    .file-link {
      color: #007bff;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .file-link:hover {
      text-decoration: underline;
    }

    .feedback-section {
      background: #e7f3ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #17a2b8;
      margin-top: 20px;
    }

    .feedback-title {
      color: #17a2b8;
      margin: 0 0 15px 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .feedback-content {
      color: #333;
    }

    .student-info {
      font-weight: 600;
      color: #17a2b8;
    }

    .feedback-rating {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stars {
      color: #ffc107;
      font-size: 1.2rem;
    }

    .rating-text {
      font-weight: 600;
      color: #17a2b8;
    }

    .feedback-comment {
      margin: 0 0 15px 0;
      font-style: italic;
      background: white;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #e9ecef;
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

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 10px;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .complaints-table {
        font-size: 0.8rem;
      }

      .modal-content {
        width: 95%;
        margin: 10px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  complaints: Complaint[] = [];
  staffMembers: Staff[] = [];
  selectedComplaint: Complaint | null = null;
  
  // Filters
  selectedStatus = '';
  selectedCategory = '';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;

  constructor(
    private adminService: AdminService,
    private complaintService: ComplaintService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadComplaints();
    this.loadStaffMembers();
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (stats: AdminStats) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadComplaints() {
    const filters = {
      status: this.selectedStatus,
      category: this.selectedCategory,
      page: this.currentPage,
      limit: 10
    };

    this.adminService.getComplaints(filters).subscribe({
      next: (response: any) => {
        this.complaints = response.complaints;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.total = response.total;
      },
      error: (error: any) => {
        console.error('Error loading complaints:', error);
      }
    });
  }

  loadStaffMembers() {
    this.adminService.getStaffMembers().subscribe({
      next: (staff: Staff[]) => {
        this.staffMembers = staff;
      },
      error: (error: any) => {
        console.error('Error loading staff:', error);
      }
    });
  }

  onSearchChange() {
    // Debounce search
    setTimeout(() => {
      this.currentPage = 1;
      this.loadComplaints();
    }, 500);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadComplaints();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadComplaints();
    }
  }

  viewComplaint(complaint: Complaint) {
    this.selectedComplaint = { ...complaint };
  }

  assignComplaint(complaint: Complaint) {
    this.selectedComplaint = { ...complaint };
  }

  closeModal() {
    this.selectedComplaint = null;
  }

  updateComplaintStatus() {
    if (!this.selectedComplaint) return;
    
    this.adminService.updateComplaintStatus(
      this.selectedComplaint._id!,
      this.selectedComplaint.status,
      this.selectedComplaint.adminNotes || ''
    ).subscribe({
      next: () => {
        this.loadComplaints();
        this.loadStats();
      },
      error: (error: any) => {
        console.error('Error updating complaint:', error);
      }
    });
  }

  assignStaff() {
    if (!this.selectedComplaint) return;
    
    this.adminService.assignComplaint(
      this.selectedComplaint._id!,
      this.selectedComplaint.assignedTo,
      this.selectedComplaint.adminNotes || ''
    ).subscribe({
      next: () => {
        this.loadComplaints();
        this.loadStats();
      },
      error: (error: any) => {
        console.error('Error assigning complaint:', error);
      }
    });
  }

  deleteComplaint(complaint: Complaint) {
    if (confirm(`Are you sure you want to delete this resolved complaint? This will remove it from admin view but keep it visible to the user.`)) {
      this.adminService.deleteComplaint(complaint._id!).subscribe({
        next: () => {
          this.loadComplaints();
          this.loadStats();
          alert('Complaint deleted successfully!');
        },
        error: (error: any) => {
          console.error('Error deleting complaint:', error);
          alert('Error deleting complaint. ' + (error.error?.message || 'Please try again.'));
        }
      });
    }
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  saveChanges() {
    if (!this.selectedComplaint) return;
    
    // Update status if changed
    this.updateComplaintStatus();
    
    // Assign staff if changed
    this.assignStaff();
    
    this.closeModal();
  }
}

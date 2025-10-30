import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Staff } from '../../../services/admin.service';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="staff-management">
      <div class="header-section">
        <h2>Staff Management</h2>
        <button class="btn btn-primary" (click)="showAddStaffForm = true">Add New Staff</button>
      </div>

      <!-- Add Staff Form -->
      <div class="add-staff-form" *ngIf="showAddStaffForm">
        <h3>Add New Staff Member</h3>
        <form (ngSubmit)="addStaff()" #staffForm="ngForm">
          <div class="form-group">
            <label for="name">Full Name:</label>
            <input type="text" id="name" name="name" [(ngModel)]="newStaff.name" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" [(ngModel)]="newStaff.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" [(ngModel)]="newStaff.password" required>
          </div>
          <div class="form-group">
            <label for="department">Department:</label>
            <select id="department" name="department" [(ngModel)]="newStaff.department" required>
              <option value="">Select Department</option>
              <option value="IT">Information Technology</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Academic">Academic</option>
              <option value="Administration">Administration</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Security">Security</option>
              <option value="Library">Library</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="!staffForm.form.valid">
              Add Staff Member
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelAddStaff()">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Staff List -->
      <div class="staff-list">
        <h3>Current Staff Members</h3>
        <div class="table-container">
          <table class="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let staff of staffMembers">
                <td>{{staff.name}}</td>
                <td>{{staff.email}}</td>
                <td>
                  <span class="department-badge" [class]="'dept-' + staff.department.toLowerCase()">
                    {{staff.department}}
                  </span>
                </td>
                <td>
                  <button class="action-btn edit" (click)="editStaff(staff)">Edit</button>
                  <button class="action-btn delete" (click)="deleteStaff(staff)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Staff Modal -->
      <div class="modal" *ngIf="editingStaff" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Edit Staff Member</h3>
            <button class="close-btn" (click)="closeEditModal()">×</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="updateStaff()" #editForm="ngForm">
              <div class="form-group">
                <label for="editName">Full Name:</label>
                <input type="text" id="editName" name="editName" [(ngModel)]="editingStaff.name" required>
              </div>
              <div class="form-group">
                <label for="editEmail">Email:</label>
                <input type="email" id="editEmail" name="editEmail" [(ngModel)]="editingStaff.email" required>
              </div>
              <div class="form-group">
                <label for="editDepartment">Department:</label>
                <select id="editDepartment" name="editDepartment" [(ngModel)]="editingStaff.department" required>
                  <option value="IT">Information Technology</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Academic">Academic</option>
                  <option value="Administration">Administration</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Security">Security</option>
                  <option value="Library">Library</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="!editForm.form.valid">
                  Update Staff Member
                </button>
                <button type="button" class="btn btn-secondary" (click)="closeEditModal()">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .staff-management {
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-section h2 {
      margin: 0;
      color: #333;
    }

    .add-staff-form {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .add-staff-form h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .staff-list {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .staff-list h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .table-container {
      overflow-x: auto;
    }

    .staff-table {
      width: 100%;
      border-collapse: collapse;
    }

    .staff-table th,
    .staff-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .staff-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .department-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .dept-it { background: #e3f2fd; color: #1976d2; }
    .dept-hr { background: #f3e5f5; color: #7b1fa2; }
    .dept-finance { background: #e8f5e8; color: #388e3c; }
    .dept-academic { background: #fff3e0; color: #f57c00; }
    .dept-administration { background: #fce4ec; color: #c2185b; }
    .dept-maintenance { background: #f5f5f5; color: #616161; }
    .dept-security { background: #ffebee; color: #d32f2f; }
    .dept-library { background: #e0f2f1; color: #00695c; }
    .dept-sports { background: #fff8e1; color: #f57f17; }
    .dept-other { background: #f1f8e9; color: #558b2f; }

    .action-btn {
      padding: 6px 12px;
      margin: 2px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.3s ease;
    }

    .action-btn.edit {
      background: #17a2b8;
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

    @media (max-width: 768px) {
      .staff-management {
        padding: 10px;
      }

      .header-section {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .form-actions {
        flex-direction: column;
      }

      .modal-content {
        width: 95%;
        margin: 10px;
      }
    }
  `]
})
export class StaffManagementComponent implements OnInit {
  staffMembers: Staff[] = [];
  showAddStaffForm = false;
  editingStaff: Staff | null = null;

  newStaff = {
    name: '',
    email: '',
    password: '',
    department: ''
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStaffMembers();
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

  addStaff() {
    this.adminService.createStaffMember(this.newStaff).subscribe({
      next: () => {
        this.loadStaffMembers();
        this.cancelAddStaff();
        alert('Staff member added successfully!');
      },
      error: (error: any) => {
        console.error('Error adding staff:', error);
        alert('Error adding staff member. Please try again.');
      }
    });
  }

  cancelAddStaff() {
    this.showAddStaffForm = false;
    this.newStaff = {
      name: '',
      email: '',
      password: '',
      department: ''
    };
  }

  editStaff(staff: Staff) {
    this.editingStaff = { ...staff };
  }

  updateStaff() {
    if (!this.editingStaff) return;

    this.adminService.updateStaffMember(this.editingStaff._id!, {
      name: this.editingStaff.name,
      email: this.editingStaff.email,
      department: this.editingStaff.department
    }).subscribe({
      next: () => {
        this.loadStaffMembers();
        this.closeEditModal();
        alert('Staff member updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating staff:', error);
        alert('Error updating staff member. Please try again.');
      }
    });
  }

  deleteStaff(staff: Staff) {
    if (confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
      this.adminService.deleteStaffMember(staff._id!).subscribe({
        next: () => {
          this.loadStaffMembers();
          alert('Staff member deleted successfully!');
        },
        error: (error: any) => {
          console.error('Error deleting staff:', error);
          alert('Error deleting staff member. ' + (error.error?.message || 'Please try again.'));
        }
      });
    }
  }

  closeEditModal() {
    this.editingStaff = null;
  }
}

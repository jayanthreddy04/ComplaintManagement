import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';

@Component({
  selector: 'app-new-complaint',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="new-complaint-container">
      <div class="complaint-card">
        <div class="header">
          <h2>Register New Complaint</h2>
          <button class="back-btn" routerLink="/dashboard">← Back to Dashboard</button>
        </div>
        <p>Fill in the details below to submit your complaint</p>
        
        <form class="complaint-form" (ngSubmit)="onSubmit()" *ngIf="!isLoading; else loading">
          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" [(ngModel)]="complaint.category" name="category" required>
              <option value="">Select Category</option>
              <option value="hostel">Hostel</option>
              <option value="mess">Mess/Food</option>
              <option value="college">College Infrastructure</option>
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="title">Title *</label>
            <input type="text" id="title" [(ngModel)]="complaint.title" name="title" 
                   placeholder="Brief title of your complaint" required maxlength="100">
            <small>{{ complaint.title.length }}/100 characters</small>
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea id="description" [(ngModel)]="complaint.description" name="description" 
                      rows="5" placeholder="Detailed description of your issue..." 
                      required maxlength="1000"></textarea>
            <small>{{ complaint.description.length }}/1000 characters</small>
          </div>

          <div class="form-group">
            <label for="proof">Photo/Video Proof (Optional)</label>
            <input type="file" id="proof" (change)="onFileSelected($event)" 
                   accept="image/*,video/*" multiple>
            <small>You can upload images or videos as evidence (Max 5MB per file)</small>
          </div>

          <div class="selected-files" *ngIf="selectedFiles.length > 0">
            <h4>Selected Files ({{ selectedFiles.length }}):</h4>
            <ul>
              <li *ngFor="let file of selectedFiles; let i = index">
                {{ file.name }} ({{ getFileSize(file.size) }})
                <button type="button" class="remove-file" (click)="removeFile(i)">×</button>
              </li>
            </ul>
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <div *ngIf="success" class="success-message">
            {{ success }}
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" routerLink="/dashboard">Cancel</button>
            <button type="submit" class="submit-btn" [disabled]="!isFormValid() || isLoading">
              {{ isLoading ? 'Submitting...' : 'Submit Complaint' }}
            </button>
          </div>
        </form>

        <ng-template #loading>
          <div class="loading">Submitting your complaint...</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .new-complaint-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }

    .complaint-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 600px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .header h2 {
      color: #333;
      margin: 0;
    }

    .back-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }

    .back-btn:hover {
      background: #5a6268;
    }

    .complaint-card p {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: bold;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      font-family: Arial, sans-serif;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .form-group small {
      display: block;
      margin-top: 5px;
      color: #666;
      font-size: 0.8rem;
    }

    .selected-files {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }

    .selected-files h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1rem;
    }

    .selected-files ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .selected-files li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
      color: #666;
    }

    .selected-files li:last-child {
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

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 5px;
      margin: 15px 0;
      text-align: center;
      border: 1px solid #f5c6cb;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 5px;
      margin: 15px 0;
      text-align: center;
      border: 1px solid #c3e6cb;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .cancel-btn {
      padding: 12px 25px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .submit-btn {
      padding: 12px 25px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .cancel-btn:hover {
      background: #5a6268;
    }

    .submit-btn:hover:not(:disabled) {
      background: #5a6fd8;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
      font-size: 16px;
    }
  `]
})
export class NewComplaintComponent {
  complaint = {
    category: '',
    title: '',
    description: ''
  };
  
  selectedFiles: File[] = [];
  isLoading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private router: Router,
    private complaintService: ComplaintService
  ) {}

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    const fileArray: File[] = Array.from(files);
    
    // Filter files by size (5MB limit)
    const validFiles = fileArray.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== fileArray.length) {
      this.error = 'Some files were too large (max 5MB per file).';
    }
    
    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    event.target.value = ''; // Reset file input
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isFormValid(): boolean {
    return !!this.complaint.category && 
           !!this.complaint.title && 
           !!this.complaint.description &&
           this.complaint.title.length >= 3 &&
           this.complaint.description.length >= 5;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.error = 'Please fill all required fields with valid information.';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    formData.append('title', this.complaint.title);
    formData.append('description', this.complaint.description);
    formData.append('category', this.complaint.category);

    // Append files if any
    this.selectedFiles.forEach(file => {
      formData.append('proofImage', file);
    });

    this.complaintService.createComplaint(formData).subscribe({
      next: (response) => {
        console.log('Complaint submitted successfully:', response);
        this.success = 'Complaint submitted successfully! Redirecting...';
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error submitting complaint:', error);
        this.error = error.error?.message || 'Failed to submit complaint. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
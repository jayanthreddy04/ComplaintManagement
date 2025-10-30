import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Complaint } from './complaint.service';

export interface AdminStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  categoryStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
}

export interface Staff {
  _id: string;
  name: string;
  email: string;
  department: string;
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  totalPages: number;
  currentPage: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`);
  }

  getComplaints(filters?: { 
    status?: string; 
    category?: string; 
    page?: number; 
    limit?: number;
    search?: string;
  }): Observable<ComplaintsResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ComplaintsResponse>(`${this.apiUrl}/admin/complaints`, { params });
  }

  getComplaintById(complaintId: string): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.apiUrl}/admin/complaints/${complaintId}`);
  }

  updateComplaintStatus(complaintId: string, status: string, adminNotes?: string): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.apiUrl}/admin/complaints/${complaintId}/status`, {
      status,
      adminNotes
    });
  }

  assignComplaint(complaintId: string, assignedTo: string, adminNotes?: string): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.apiUrl}/admin/complaints/${complaintId}/assign`, {
      assignedTo,
      adminNotes
    });
  }

  getStaffMembers(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/admin/staff`);
  }

  createStaffMember(staffData: {
    name: string;
    email: string;
    password: string;
    department: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/staff`, staffData);
  }

  updateStaffMember(staffId: string, staffData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/staff/${staffId}`, staffData);
  }

  deleteStaffMember(staffId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/staff/${staffId}`);
  }

  deleteComplaint(complaintId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/complaints/${complaintId}`);
  }
}

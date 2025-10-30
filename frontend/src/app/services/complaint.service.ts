import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Complaint {
  _id?: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdBy: any;
  assignedTo?: any;
  proofImage?: string;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
  workProof?: {
    description: string;
    files: string[];
    submittedBy: any;
    submittedAt: Date;
  };
  adminNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
export class ComplaintService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createComplaint(complaintData: FormData): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.apiUrl}/complaints`, complaintData);
  }

  getComplaints(filters?: { status?: string; category?: string; page?: number; limit?: number }): Observable<ComplaintsResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ComplaintsResponse>(`${this.apiUrl}/complaints`, { params });
  }

  updateComplaintStatus(complaintId: string, status: string, assignedTo?: string): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.apiUrl}/complaints/${complaintId}`, { status, assignedTo });
  }

  submitFeedback(complaintId: string, feedback: { rating: number; comment: string }): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.apiUrl}/complaints/${complaintId}/feedback`, feedback);
  }

  submitWorkProof(complaintId: string, workProofData: FormData): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.apiUrl}/complaints/${complaintId}/work-proof`, workProofData);
  }
}
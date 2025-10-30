import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileUser> {
    return this.http.get<ProfileUser>(`${this.apiUrl}/users/profile`);
  }

  updateProfile(profileData: { name?: string; department?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/profile`, profileData);
  }

  getStaffMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/staff`);
  }
}
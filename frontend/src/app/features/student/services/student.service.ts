import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StudentProfile, UpdateStudentRequest } from '../models/student-profile.model';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StudentService {

  private readonly API = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  // GET /api/students/me
  getProfile(): Observable<StudentProfile> {
    return this.http.get<ApiResponse<StudentProfile> | StudentProfile>(`${this.API}/me`)
      .pipe(map(res => this.unwrapResponse(res)));
  }

  // PUT /api/students/me
  updateProfile(req: UpdateStudentRequest): Observable<StudentProfile> {
    return this.http.put<ApiResponse<StudentProfile> | StudentProfile>(`${this.API}/me`, req)
      .pipe(map(res => this.unwrapResponse(res)));
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.API}/me`);
  }

  private unwrapResponse<T>(response: ApiResponse<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  }
}
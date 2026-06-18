import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MentorProfile, MentorProfileRequest } from '../models/mentor-profile.model';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class MentorProfileService {

  private readonly API = `${environment.apiUrl}/api/mentors`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<MentorProfile> {
    return this.http.get<ApiResponse<MentorProfile>>(`${this.API}/me`)
      .pipe(map(res => res.data));
  }

  updateMyProfile(request: MentorProfileRequest): Observable<MentorProfile> {
    return this.http.put<ApiResponse<MentorProfile>>(`${this.API}/me`, request)
      .pipe(map(res => res.data));
  }

  updateAvailability(isAvailable: boolean): Observable<void> {
    const params = new HttpParams().set('isAvailable', String(isAvailable));
    return this.http.patch<ApiResponse<void>>(`${this.API}/me/availability`, null, { params })
      .pipe(map(() => void 0));
  }

  deleteMyProfile(): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/me`)
      .pipe(map(() => void 0));
  }
}

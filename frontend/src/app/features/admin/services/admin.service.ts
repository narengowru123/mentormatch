// src/app/features/admin/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats } from '../models/admin-stats.model';
import { AdminUser, AdminUserDetail } from '../models/admin-user.model';
import { AdminSession } from '../models/admin-session.model';
import { AdminReview } from '../models/admin-review.model';
import { BroadcastRequest } from '../models/broadcast-request.model';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  // ────────────────────────────────────────────────────────────
  // Stats
  // ────────────────────────────────────────────────────────────
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  // ────────────────────────────────────────────────────────────
  // Users
  // ────────────────────────────────────────────────────────────
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  getUsersByRole(role: string): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users?role=${role}`);
  }

  getUserById(userId: number): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.apiUrl}/users/${userId}`);
  }

  toggleUserStatus(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.apiUrl}/users/${userId}/toggle`, {});
  }

  // ────────────────────────────────────────────────────────────
  // Sessions
  // ────────────────────────────────────────────────────────────
  getAllSessions(): Observable<AdminSession[]> {
    return this.http.get<AdminSession[]>(`${this.apiUrl}/sessions`);
  }

  getSessionsByStatus(status: string): Observable<AdminSession[]> {
    return this.http.get<AdminSession[]>(`${this.apiUrl}/sessions?status=${status}`);
  }

  getSessionById(sessionId: number): Observable<AdminSession> {
    return this.http.get<AdminSession>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  getTop5Mentors(): Observable<AdminUserDetail[]> {
    return this.http.get<AdminUserDetail[]>(`${this.apiUrl}/mentors/top5`);
  }

  getRecentSessions(): Observable<AdminSession[]> {
    return this.http.get<AdminSession[]>(`${this.apiUrl}/sessions/recent`);
  }

  cancelSession(sessionId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sessions/${sessionId}/cancel`, {});
  }

  forceCompleteSession(sessionId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sessions/${sessionId}/force-complete`, {});
  }

  deleteSession(sessionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/${sessionId}`);
  }

  // ────────────────────────────────────────────────────────────
  // Reviews
  // ────────────────────────────────────────────────────────────
  getAllReviews(): Observable<AdminReview[]> {
    return this.http.get<AdminReview[]>(`${this.apiUrl}/reviews`);
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }

  // ────────────────────────────────────────────────────────────
  // Broadcast
  // ────────────────────────────────────────────────────────────
  sendBroadcast(request: BroadcastRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/broadcast`, request);
  }
}
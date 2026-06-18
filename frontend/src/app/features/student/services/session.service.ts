// src/app/features/student/services/session.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface SessionRequest {
    mentorId: number;
    topic: string;
    message?: string;
    planType: string;
    totalOccurrences: number;
    scheduledAt: string;      // ISO format: "2026-06-20T10:00:00"
    durationMinutes: number;  // 60 or 120
}

// NEW: Child structural alignment model node matching the backend layout
export interface OccurrenceSummary {
    id: number;
    scheduledAt: string;
    durationMinutes: number;
    meetingLink: string | null;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}

export interface SessionResponse {
    id: number;
    topic: string;
    message: string;
    status: string;
    planType: string;
    totalOccurrences: number;
    createdAt: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingLink: string | null;
    mentorId: number;
    mentorName: string;
    studentId: number;
    studentName: string;
    
    // 🔽 ADDED NEW MAPPING FIELDS FOR THE STUDENT DATA STREAM
    rejectionReason?: string | null;
    occurrences?: OccurrenceSummary[];
}

@Injectable({ providedIn: 'root' })
export class SessionService {

    private readonly API = `${environment.apiUrl}/api/sessions`;

    constructor(private http: HttpClient) {}

    // POST /api/sessions — Book a session
    bookSession(request: SessionRequest): Observable<SessionResponse> {
        return this.http
            .post<ApiResponse<SessionResponse>>(this.API, request)
            .pipe(map(res => res.data));
    }

    // GET /api/sessions/my — Student's sessions
    getMySessions(): Observable<SessionResponse[]> {
        return this.http
            .get<ApiResponse<SessionResponse[]>>(`${this.API}/my`)
            .pipe(map(res => res.data));
    }

    // GET /api/sessions/mentor — Mentor's sessions
    getMentorSessions(): Observable<SessionResponse[]> {
        return this.http
            .get<ApiResponse<SessionResponse[]>>(`${this.API}/mentor`)
            .pipe(map(res => res.data));
    }

    // PATCH cancel
    cancelSession(id: number): Observable<SessionResponse> {
        return this.http
            .patch<ApiResponse<SessionResponse>>(`${this.API}/${id}/cancel`, {})
            .pipe(map(res => res.data));
    }
}
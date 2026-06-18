// src/app/core/services/review.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReviewRequest, ReviewResponse } from '../models/review.model';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {

    private readonly API = `${environment.apiUrl}/api/reviews`;

    constructor(private http: HttpClient) {}

    // POST /api/reviews/sessions/{sessionId}
    submitReview(sessionId: number, request: ReviewRequest): Observable<ReviewResponse> {
        return this.http
            .post<ApiResponse<ReviewResponse>>(`${this.API}/sessions/${sessionId}`, request)
            .pipe(map(res => res.data));
    }

    // GET /api/reviews/mentors/{mentorId}
    getMentorReviews(mentorId: number): Observable<ReviewResponse[]> {
        return this.http
            .get<ApiResponse<ReviewResponse[]>>(`${this.API}/mentors/${mentorId}`)
            .pipe(map(res => res.data));
    }

    // GET /api/reviews/sessions/{sessionId}
    getSessionReviews(sessionId: number): Observable<ReviewResponse[]> {
        return this.http
            .get<ApiResponse<ReviewResponse[]>>(`${this.API}/sessions/${sessionId}`)
            .pipe(map(res => res.data));
    }
}
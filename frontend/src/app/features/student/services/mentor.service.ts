import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MentorProfile, MentorFilter } from '../models/mentor.model';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class MentorService {

    private readonly API = `${environment.apiUrl}/api/mentors`;

    constructor(private http: HttpClient) {}

    // GET /api/mentors?industry=&minRating=&skill=
    getMentors(filters: MentorFilter = {}): Observable<MentorProfile[]> {
        let params = new HttpParams();
        if (filters.industry)  params = params.set('industry',  filters.industry);
        if (filters.minRating) params = params.set('minRating', filters.minRating.toString());
        if (filters.skill)     params = params.set('skill',     filters.skill);

        return this.http.get<ApiResponse<unknown[]> | unknown[]>(this.API, { params })
            .pipe(map(res => this.mapMentorList(res)));
    }

    // GET /api/mentors/{id}
    getMentorById(id: number): Observable<MentorProfile> {
        return this.http.get<ApiResponse<unknown> | unknown>(`${this.API}/${id}`)
            .pipe(map(res => this.mapMentor(this.unwrapResponse(res))));
    }

    // GET /api/mentors/recommended
    getRecommended(): Observable<MentorProfile[]> {
        return this.http.get<ApiResponse<unknown[]> | unknown[]>(`${this.API}/recommended`)
            .pipe(map(res => this.mapMentorList(res)));
    }

    private mapMentorList(response: ApiResponse<unknown[]> | unknown[]): MentorProfile[] {
        const data = this.unwrapResponse(response);
        return Array.isArray(data) ? data.map(item => this.mapMentor(item)) : [];
    }

    private unwrapResponse<T>(response: ApiResponse<T> | T): T {
        if (response && typeof response === 'object' && 'data' in response) {
            return (response as ApiResponse<T>).data;
        }
        return response as T;
    }

    private mapMentor(raw: any): MentorProfile {
        const user = raw?.user ?? {};
        const fullName = user.fullName ?? raw?.fullName ?? raw?.name ?? 'Mentor';

        return {
            id: Number(raw?.id ?? 0),
            user: {
                id: Number(user.id ?? raw?.userId ?? 0),
                fullName,
                email: user.email ?? raw?.email ?? ''
            },
            bio: raw?.bio ?? '',
            industry: raw?.industry ?? '',
            hourlyRate: raw?.hourlyRate === null || raw?.hourlyRate === undefined
                ? null
                : Number(raw.hourlyRate),
            skills: Array.isArray(raw?.skills) ? raw.skills : [],
            isAvailable: raw?.isAvailable ?? raw?.available ?? false,
            rating: Number(raw?.rating ?? 0)
        };
    }
}

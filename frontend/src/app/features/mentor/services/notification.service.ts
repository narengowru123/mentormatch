import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationItem } from '../../student/models/notification.model';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly apiUrl = `${environment.apiUrl}/api/notifications`;

    constructor(private http: HttpClient) {}

    loadAll(): Observable<NotificationItem[]> {
        return this.http.get<ApiResponse<NotificationItem[]>>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    getUnreadCount(): Observable<number> {
        return this.http.get<ApiResponse<number>>(`${this.apiUrl}/unread-count`).pipe(
            map(response => response.data)
        );
    }

    markAllAsRead(): Observable<void> {
        return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/read-all`, {}).pipe(
            map(() => undefined)
        );
    }

    markOneAsRead(id: number): Observable<void> {
        return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {}).pipe(
            map(() => undefined)
        );
    }
}
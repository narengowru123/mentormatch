// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationItem } from '../models/notification.model';
import {environment} from "../../../../environments/environment";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

    private readonly API = `${environment.apiUrl}/api/notifications`;

    // Live streams — components subscribe to these
    private _notifications$ = new BehaviorSubject<NotificationItem[]>([]);
    readonly notifications$ = this._notifications$.asObservable();

    private _unreadCount$ = new BehaviorSubject<number>(0);
    readonly unreadCount$ = this._unreadCount$.asObservable();

    constructor(private http: HttpClient) {}

    // Load all notifications from REST
    loadAll(): Observable<NotificationItem[]> {
        return this.http.get<ApiResponse<NotificationItem[]>>(this.API).pipe(
            map(res => {
                this._notifications$.next(res.data);
                return res.data;
            })
        );
    }

    // Load unread count
    loadUnreadCount(): Observable<number> {
        return this.http.get<ApiResponse<number>>(`${this.API}/unread-count`).pipe(
            map(res => {
                this._unreadCount$.next(res.data);
                return res.data;
            })
        );
    }

    // Mark all as read
    markAllAsRead(): Observable<void> {
        return this.http.patch<ApiResponse<void>>(`${this.API}/read-all`, {}).pipe(
            map(() => {
                const updated = this._notifications$.getValue().map(n => ({ ...n, isRead: true }));
                this._notifications$.next(updated);
                this._unreadCount$.next(0);
            })
        );
    }

    // Mark one as read
    markOneAsRead(id: number): Observable<void> {
        return this.http.patch<ApiResponse<void>>(`${this.API}/${id}/read`, {}).pipe(
            map(() => {
                const updated = this._notifications$.getValue().map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                this._notifications$.next(updated);
                this._unreadCount$.next(updated.filter(n => !n.isRead).length);
            })
        );
    }
}

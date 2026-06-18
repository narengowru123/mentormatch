// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NotificationItem } from '../models/notification.model';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

    private readonly API = 'http://localhost:8081/api/notifications';
    private stompClient: Client | null = null;

    // Live streams — components subscribe to these
    private _notifications$ = new BehaviorSubject<NotificationItem[]>([]);
    readonly notifications$ = this._notifications$.asObservable();

    private _unreadCount$ = new BehaviorSubject<number>(0);
    readonly unreadCount$ = this._unreadCount$.asObservable();

    constructor(private http: HttpClient) {}

    // Call after login
    connect(userId: number, token: string): void {
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                this.stompClient!.subscribe('/user/queue/notifications', (frame:any) => {
                    const incoming: NotificationItem = JSON.parse(frame.body);
                    const current = this._notifications$.getValue();
                    this._notifications$.next([incoming, ...current]);
                    this._unreadCount$.next(this._unreadCount$.getValue() + 1);
                });
            }
        });
        this.stompClient.activate();
    }

    // Call on logout
    disconnect(): void {
        this.stompClient?.deactivate();
        this.stompClient = null;
    }

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
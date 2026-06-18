// src/app/features/student/pages/my-sessions/my-sessions.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService, SessionResponse } from '../../services/session.service';

interface Tab { label: string; value: string; count: number; }

@Component({
  selector: 'app-my-sessions',
  templateUrl: './my-sessions.component.html',
  styleUrls: ['./my-sessions.component.css']
})
export class MySessionsComponent implements OnInit {

  allSessions: SessionResponse[] = [];
  filteredSessions: SessionResponse[] = [];
  loading = true;
  errorMsg = '';
  activeTab = 'ALL';

  tabs: Tab[] = [
    { label: 'All',       value: 'ALL',       count: 0 },
    { label: 'Pending',   value: 'PENDING',   count: 0 },
    { label: 'Accepted',  value: 'ACCEPTED',  count: 0 },
    { label: 'Completed', value: 'COMPLETED', count: 0 },
    { label: 'Rejected',  value: 'REJECTED',  count: 0 },
    { label: 'Cancelled', value: 'CANCELLED', count: 0 },
  ];

  constructor(
      private sessionService: SessionService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.sessionService.getMySessions().subscribe({
      next: (sessions) => {
        this.allSessions = sessions || [];
        this.updateTabCounts();
        this.applyTab('ALL');
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load sessions.';
        this.loading = false;
      }
    });
  }

  updateCounts(): void {
    this.tabs[0].count = this.allSessions.length;
    this.tabs[1].count = this.allSessions.filter(s => s.status === 'PENDING').length;
    this.tabs[2].count = this.allSessions.filter(s => s.status === 'ACCEPTED').length;
    this.tabs[3].count = this.allSessions.filter(s => s.status === 'COMPLETED').length;
    this.tabs[4].count = this.allSessions.filter(s => s.status === 'REJECTED').length;
    this.tabs[5].count = this.allSessions.filter(s => s.status === 'CANCELLED').length;
  }

  applyTab(value: string): void {
    this.activeTab = value;
    this.filteredSessions = value === 'ALL'
        ? this.allSessions
        : this.allSessions.filter(s => s.status === value);
  }

  // Cancel a PENDING or ACCEPTED session
  cancelSession(id: number): void {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    this.sessionService.cancelSession(id).subscribe({
      next: () => { this.loadSessions(); },
      error: () => { alert('Failed to cancel session. Please try again.'); }
    });
  }

  // Navigate to review page — only shown for COMPLETED sessions
  goToReview(sessionId: number): void {
    this.router.navigate(['/student/submit-review', sessionId]);
  }

  browseMentors(): void {
    this.router.navigate(['/student/mentors']);
  }

  getInitials(name: string): string {
    if (!name) return 'M';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACCEPTED:  'status-accepted',
      PENDING:   'status-pending',
      COMPLETED: 'status-completed',
      REJECTED:  'status-rejected',
      CANCELLED: 'status-cancelled'
    };
    return map[status] ?? '';
  }

  getPlanIcon(planType: string): string {
    const icons: Record<string, string> = {
      SINGLE: '1️⃣', WEEKLY: '📅', MONTHLY: '🗓️', DAILY: '☀️'
    };
    return icons[planType] ?? '📌';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  goback(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
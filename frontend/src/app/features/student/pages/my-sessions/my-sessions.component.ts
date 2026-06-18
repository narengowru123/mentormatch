// src/app/features/student/pages/my-sessions/my-sessions.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService, SessionResponse } from '../../services/session.service';

type TabStatus = 'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

interface Tab {
  label: string;
  value: TabStatus;
  count: number;
}

@Component({
  selector: 'app-my-sessions',
  templateUrl: './my-sessions.component.html',
  styleUrls: ['./my-sessions.component.css']
})
export class MySessionsComponent implements OnInit {

  allSessions: SessionResponse[]      = [];
  filteredSessions: SessionResponse[] = [];
  activeTab: TabStatus                = 'ALL';
  loading  = true;
  errorMsg = '';

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

  updateTabCounts(): void {
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      count: tab.value === 'ALL'
          ? this.allSessions.length
          : this.allSessions.filter(s => s.status === tab.value).length
    }));
  }

  applyTab(tab: TabStatus): void {
    this.activeTab = tab;
    this.filteredSessions = tab === 'ALL'
        ? this.allSessions
        : this.allSessions.filter(s => s.status === tab);
  }

  viewSession(id: number): void {
    this.router.navigate(['/student/sessions', id]);
  }

  browseMentors(): void {
    this.router.navigate(['/student/mentors']);
  }

  getInitials(name: string): string {
    return (name ?? 'M').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
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

  getPlanIcon(plan: string): string {
    const map: Record<string, string> = {
      SINGLE: '1️⃣', WEEKLY: '📅', MONTHLY: '🗓️'
    };
    return map[plan] ?? '📅';
  }

  goback(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
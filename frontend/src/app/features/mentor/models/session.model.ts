// src/app/features/mentor/models/session.model.ts

export interface OccurrenceSummary {
  id: number;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}

export interface SessionResponse {
  id: number;
  sessionId: number; // Retained to ensure button click bindings stay compatible
  studentName: string;
  studentEmail: string;
  topic: string;
  planType: 'SINGLE' | 'WEEKLY' | 'MONTHLY';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  totalOccurrences: number;
  mentorName: string;
  mentorId: number;
  studentId: number;
  scheduledAt: string | null;
  durationMinutes: number | null;
  meetingLink: string | null;
  occurrences: OccurrenceSummary[];
  
  // 🔽 ADDED: Allows the HTML template to read logged rejections cleanly
  rejectionReason?: string | null; 
}
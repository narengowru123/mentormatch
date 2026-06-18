import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MentorProfile } from './models/mentor-profile.model';
import { MentorProfileService } from './services/mentor-profile.service';
import { SessionManagementService } from './services/session.service';
import { SessionResponse } from './models/session.model';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-mentor-dashboard',
  templateUrl: './mentor-dashboard.component.html',
  styleUrls: ['./mentor-dashboard.component.css']
})
export class MentorDashboardComponent implements OnInit {

  activeTab: 'profile' | 'sessions' | 'reviews' = 'profile';

  // Profile fields
  form!: FormGroup;
  profile: MentorProfile | null = null;
  skillTags: string[] = [];
  skillInputValue = '';
  loading = true;
  saving = false;
  availabilitySaving = false;
  deleting = false;
  confirmDelete = false;
  saveSuccess = false;
  errorMsg = '';
  unreadCount = 0;

  // Session Fields
  sessionsList: SessionResponse[] = [];
  sessionsLoading = false;
  sessionActionRunning = false;

  // Accept Modal Configurations
  showAcceptModal = false;
  selectedSessionId: number | null = null;
  inputMeetingLink = '';

  // Reject Modal Configurations
  showRejectModal = false;
  selectedRejectSessionId: number | null = null;
  rejectionReasonText = '';

  constructor(
    private fb: FormBuilder,
    private mentorService: MentorProfileService,
    private authService: AuthService,
    private sessionService: SessionManagementService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      industry: ['', [Validators.required, Validators.maxLength(100)]],
      hourlyRate: [null, [Validators.min(0), Validators.max(100000)]],
      bio: ['', [Validators.required, Validators.maxLength(1000)]]
    });
    this.loadProfile();
  }

  switchTab(tabName: 'profile' | 'sessions' | 'reviews'): void {
    this.activeTab = tabName;
    if (tabName === 'sessions') this.loadSessionRequests();
    if (tabName === 'reviews') this.loadMyReviews();
  }

  loadSessionRequests(): void {
    this.sessionsLoading = true;
    this.errorMsg = '';
    this.sessionService.getMySessions().subscribe({
      next: (res) => { this.sessionsList = res.data || []; this.sessionsLoading = false; },
      error: () => { this.errorMsg = 'Failed to load sessions.'; this.sessionsLoading = false; }
    });
  }

  // UPDATED URL: Now maps directly to the authenticated endpoint /api/reviews/mentor/me
  loadMyReviews(): void {
    this.reviewsLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/reviews/mentor/me`).subscribe({
      next: (res) => {
        this.reviewsList = res.data || [];
        this.reviewsLoading = false;
      },
      error: () => {
        this.reviewsLoading = false;
      }
    });
  }

  // --- Acceptance Action Modals ---
  openAcceptWindow(id: number): void {
    this.selectedSessionId = id;
    this.inputMeetingLink = '';
    this.showAcceptModal = true;
  }

  closeAcceptWindow(): void {
    this.showAcceptModal = false;
    this.selectedSessionId = null;
  }

  confirmAcceptance(): void {
    if (!this.inputMeetingLink.trim() || !this.selectedSessionId) return;
    this.sessionActionRunning = true;
    this.sessionService.acceptSession(this.selectedSessionId, this.inputMeetingLink.trim()).subscribe({
      next: () => { this.sessionActionRunning = false; this.closeAcceptWindow(); this.loadSessionRequests(); },
      error: () => { this.sessionActionRunning = false; alert('Could not accept session.'); }
    });
  }

  // --- Rejection Modal Handlers ---
  openRejectionModal(id: number): void {
    this.selectedRejectSessionId = id;
    this.rejectionReasonText = '';
    this.showRejectModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectModal = false;
    this.selectedRejectSessionId = null;
  }

  confirmRejection(): void {
    if (!this.rejectionReasonText.trim() || !this.selectedRejectSessionId) return;

    this.sessionActionRunning = true;
    this.sessionService.rejectSession(this.selectedRejectSessionId, this.rejectionReasonText.trim()).subscribe({
      next: () => {
        this.sessionActionRunning = false;
        this.closeRejectionModal();
        this.loadSessionRequests();
      },
      error: () => {
        this.sessionActionRunning = false;
        alert('Could not reject request. Verify connection.');
      }
    });
  }

  // --- Occurrence Cancellation Handlers ---
  executeOccurrenceCancel(occurrenceId: number): void {
    if (!confirm('Cancel this specific timeline occurrence slot? Student will be updated.')) return;

  executeOccurrenceCancel(occurrenceId: number): void {
    if (!confirm('Cancel this slot?')) return;
    this.sessionActionRunning = true;
    this.sessionService.cancelOccurrence(occurrenceId).subscribe({
      next: () => { this.sessionActionRunning = false; this.loadSessionRequests(); },
      error: () => { this.sessionActionRunning = false; alert('Failed to cancel slot.'); }
    });
  }

  // --- Profile Logic Matrix ---
  loadProfile(): void {
    this.loading = true;
    this.mentorService.getMyProfile().subscribe({
      next: (profile) => { this.applyProfile(profile); this.loading = false; },
      error: () => {
        this.loading = false; this.profile = null; this.resetForm();
        this.errorMsg = 'Complete your mentor profile to appear in student search.';
      }
    });
  }

  applyProfile(profile: MentorProfile): void {
    this.profile = profile;
    this.skillTags = profile.skills ?? [];
    this.form.patchValue({ industry: profile.industry ?? '', hourlyRate: profile.hourlyRate ?? null, bio: profile.bio ?? '' });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.mentorService.updateMyProfile({
      industry: this.form.value.industry,
      hourlyRate: this.form.value.hourlyRate === null || this.form.value.hourlyRate === '' ? null : Number(this.form.value.hourlyRate),
      bio: this.form.value.bio,
      skills: this.skillTags
    }).subscribe({
      next: (profile) => { this.applyProfile(profile); this.saving = false; this.saveSuccess = true; setTimeout(() => (this.saveSuccess = false), 3000); },
      error: () => { this.errorMsg = 'Profile save failed.'; this.saving = false; }
    });
  }

  toggleAvailability(): void {
    if (!this.profile || this.availabilitySaving) return;
    const nextValue = !this.profile.isAvailable;
    this.availabilitySaving = true;
    this.mentorService.updateAvailability(nextValue).subscribe({
      next: () => { this.profile = { ...this.profile!, isAvailable: nextValue }; this.availabilitySaving = false; },
      error: () => { this.errorMsg = 'Availability update failed.'; this.availabilitySaving = false; }
    });
  }

  requestDeleteProfile(): void { if (!this.profile) return; this.confirmDelete = true; }
  cancelDeleteProfile(): void { this.confirmDelete = false; }

  deleteProfile(): void {
    if (!this.profile || this.deleting) return;
    this.deleting = true;
    this.mentorService.deleteMyProfile().subscribe({
      next: () => {
        this.profile = null; this.skillTags = []; this.skillInputValue = '';
        this.resetForm(); this.confirmDelete = false; this.deleting = false;
        this.saveSuccess = true; setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: () => { this.errorMsg = 'Profile delete failed.'; this.deleting = false; }
    });
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); this.commitSkill(); }
    if (event.key === 'Backspace' && !this.skillInputValue && this.skillTags.length) { this.skillTags.pop(); }
  }

  commitSkill(): void {
    const value = this.skillInputValue.trim().replace(/,+$/, '');
    if (value && !this.skillTags.includes(value)) { this.skillTags.push(value); }
    this.skillInputValue = '';
  }

  removeSkill(skill: string): void { this.skillTags = this.skillTags.filter(item => item !== skill); }
  get initials(): string { return this.displayName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(); }
  get displayName(): string { return this.profile?.user?.fullName || this.authService.getFullName() || 'Mentor'; }
  get email(): string { return this.profile?.user?.email || this.authService.getUserData()?.email || ''; }
  get bioLength(): number { return (this.form.get('bio')?.value ?? '').length; }
  get profileCompletion(): number {
    const fields = [this.form.get('industry')?.value, this.form.get('hourlyRate')?.value !== null && this.form.get('hourlyRate')?.value !== '', this.form.get('bio')?.value, this.skillTags.length > 0];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }

  logout(): void { this.authService.logout(); }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => { this.unreadCount = count; },
      error: () => { this.unreadCount = 0; }
    });
  }

  private resetForm(): void { this.form.reset({ industry: '', hourlyRate: null, bio: '' }); }
}
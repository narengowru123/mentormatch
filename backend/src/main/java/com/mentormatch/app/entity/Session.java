package com.mentormatch.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
public class Session {

    public enum SessionStatus {
        PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED
    }

    public enum PlanType {
        SINGLE, WEEKLY, MONTHLY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private PlanType planType;

    @Column(name = "total_occurrences", nullable = false)
    private Integer totalOccurrences;

    // When the student wants the session scheduled
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    // Duration in minutes — 60 or 120
    @Column(name = "duration_minutes")
    private Integer durationMinutes = 60;

    // Meeting link added by mentor when accepting
    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    // NEW: Text field to record why a mentor declined the application request
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionOccurrence> occurrences = new ArrayList<>();

    public Session() {}

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public PlanType getPlanType() { return planType; }
    public void setPlanType(PlanType planType) { this.planType = planType; }

    public Integer getTotalOccurrences() { return totalOccurrences; }
    public void setTotalOccurrences(Integer totalOccurrences) { this.totalOccurrences = totalOccurrences; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    // NEW: Getters and Setters for the missing field
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<SessionOccurrence> getOccurrences() { return occurrences; }
    public void setOccurrences(List<SessionOccurrence> occurrences) { this.occurrences = occurrences; }
}
package com.mentormatch.app.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing an individual segregated schedule slot
 * underneath a parent package deal session.
 */
public class OccurrenceResponse {

    private Long id;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingLink;
    private String status;

    // Default Constructor
    public OccurrenceResponse() {}

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
package com.mentormatch.app.service;

import com.mentormatch.app.dto.SessionRequest;
import com.mentormatch.app.dto.SessionResponse;
import com.mentormatch.app.dto.OccurrenceResponse;
import com.mentormatch.app.entity.MentorProfile;
import com.mentormatch.app.entity.Session;
import com.mentormatch.app.entity.SessionOccurrence;
import com.mentormatch.app.entity.User;
import com.mentormatch.app.repository.MentorRepository;
import com.mentormatch.app.repository.SessionRepository;
import com.mentormatch.app.repository.SessionOccurrenceRepository;
import com.mentormatch.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionOccurrenceRepository occurrenceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MentorRepository mentorRepository;

    public SessionService(SessionRepository sessionRepository,
                          SessionOccurrenceRepository occurrenceRepository,
                          UserRepository userRepository,
                          NotificationService notificationService,
                          MentorRepository mentorRepository) {
        this.sessionRepository = sessionRepository;
        this.occurrenceRepository = occurrenceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mentorRepository = mentorRepository;
    }

    // POST /api/sessions — Student books a session using original SessionRequest definition
    @Transactional
    public SessionResponse bookSession(SessionRequest request, String studentEmail) {

        // 1. Get student
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 2. Get mentor
        MentorProfile mentorProfile = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        User mentor = mentorProfile.getUser();

        // 3. Create parent container session
        Session session = new Session();
        session.setMentor(mentor);
        session.setStudent(student);
        session.setTopic(request.getTopic());
        session.setMessage(request.getMessage());
        session.setPlanType(Session.PlanType.valueOf(request.getPlanType()));
        session.setTotalOccurrences(request.getTotalOccurrences());
        session.setStatus(Session.SessionStatus.PENDING);
        session.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60);

        // Parse starting timestamp safely
        LocalDateTime startDateTime = null;
        if (request.getScheduledAt() != null && !request.getScheduledAt().isEmpty()) {
            try {
                startDateTime = LocalDateTime.parse(request.getScheduledAt());
                session.setScheduledAt(startDateTime);
            } catch (Exception e) {
                // If parsing fails, leave it null
            }
        }

        Session savedParent = sessionRepository.save(session);

        // 4. AUTOMATIC CHRONOLOGICAL GENERATOR FOR MATRIX ROWS
        if (startDateTime != null && request.getTotalOccurrences() > 0) {
            LocalDateTime nextSlotTime = startDateTime;

            for (int i = 0; i < request.getTotalOccurrences(); i++) {
                SessionOccurrence occurrence = new SessionOccurrence();
                occurrence.setSession(savedParent); // Link child back to parent container ID
                occurrence.setScheduledAt(nextSlotTime);
                occurrence.setDurationMinutes(savedParent.getDurationMinutes());

                // TYPE-SAFE ENUM ASSIGNMENT RESOLVED
                occurrence.setStatus(Session.SessionStatus.PENDING);

                occurrenceRepository.save(occurrence);

                // Increment rule: Advance next slot date by exactly 1 week (7 days) for recurring packages
                if (savedParent.getPlanType() == Session.PlanType.WEEKLY || savedParent.getPlanType() == Session.PlanType.MONTHLY) {
                    nextSlotTime = nextSlotTime.plusWeeks(1);
                }
            }
        }

        // 5. Notify mentor
        notificationService.send(
                mentor.getId(),
                "New Session Request!",
                student.getFullName() + " wants to book a " + request.getPlanType() + " package with you.",
                "/mentor/dashboard"
        );

        return toResponse(savedParent);
    }

    // GET /api/sessions/my — Get student's sessions
    public List<SessionResponse> getMySessions(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return sessionRepository.findAllSessionsByStudentId(student.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // GET /api/sessions/mentor — Get mentor's sessions
    public List<SessionResponse> getMentorSessions(String mentorEmail) {
        User mentor = userRepository.findByEmail(mentorEmail)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        return sessionRepository.findAllSessionsByMentorId(mentor.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // PATCH /api/sessions/{id}/accept — Mentor accepts and cascades updates to individual slots
    @Transactional
    public SessionResponse acceptSession(Long sessionId, String mentorEmail, String meetingLink) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(Session.SessionStatus.ACCEPTED);

        if (meetingLink != null && !meetingLink.isBlank()) {
            session.setMeetingLink(meetingLink);
        }

        // Cascade acceptance status and meeting link down to all generated sub-occurrences
        if (session.getOccurrences() != null) {
            for (SessionOccurrence occurrence : session.getOccurrences()) {
                // TYPE-SAFE ENUM ASSIGNMENT RESOLVED
                occurrence.setStatus(Session.SessionStatus.ACCEPTED);
                if (meetingLink != null) {
                    occurrence.setMeetingLink(meetingLink);
                }
                occurrenceRepository.save(occurrence);
            }
        }

        Session saved = sessionRepository.save(session);

        notificationService.send(
                session.getStudent().getId(),
                "Session Accepted! 🎉",
                session.getMentor().getFullName() + " accepted your session package! Live space generated.",
                "/student/sessions"
        );

        return toResponse(saved);
    }

    // PATCH /api/sessions/{id}/reject — Mentor rejects and logs custom text box reason parameters
    @Transactional
    public SessionResponse rejectSession(Long sessionId, String mentorEmail, String reasonText) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(Session.SessionStatus.REJECTED);
        session.setRejectionReason(reasonText); // FIXED: Native, non-reflection property call works smoothly now!

        // Cascade rejection state down to all child entries
        if (session.getOccurrences() != null) {
            for (SessionOccurrence occurrence : session.getOccurrences()) {
                // TYPE-SAFE ENUM ASSIGNMENT RESOLVED
                occurrence.setStatus(Session.SessionStatus.REJECTED);
                occurrenceRepository.save(occurrence);
            }
        }

        Session saved = sessionRepository.save(session);

        notificationService.send(
                session.getStudent().getId(),
                "Session Rejected",
                session.getMentor().getFullName() + " rejected your session request. Reason: " + reasonText,
                "/student/sessions"
        );

        return toResponse(saved);
    }

    // PATCH /api/sessions/{id}/cancel — Student cancels complete package group
    @Transactional
    public SessionResponse cancelSession(Long sessionId, String studentEmail) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(Session.SessionStatus.CANCELLED);

        // Drop all individual scheduling timestamps rows simultaneously
        if (session.getOccurrences() != null) {
            for (SessionOccurrence occurrence : session.getOccurrences()) {
                // TYPE-SAFE ENUM ASSIGNMENT RESOLVED (Set to CANCELLED instead of PENDING)
                occurrence.setStatus(Session.SessionStatus.CANCELLED);
                occurrenceRepository.save(occurrence);
            }
        }

        Session saved = sessionRepository.save(session);

        notificationService.send(
                session.getMentor().getId(),
                "Session Cancelled",
                session.getStudent().getFullName() + " cancelled their session package.",
                "/mentor/dashboard"
        );

        return toResponse(saved);
    }

    // PATCH /api/sessions/occurrences/{id}/cancel — Mentor cancels granular occurrence slot
    @Transactional
    public void cancelIndividualOccurrence(Long occurrenceId) {
        SessionOccurrence occurrence = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new RuntimeException("Target timeline slot not found"));

        // TYPE-SAFE ENUM ASSIGNMENT RESOLVED
        occurrence.setStatus(Session.SessionStatus.CANCELLED);
        occurrenceRepository.save(occurrence);

        // Verification validation: If all child spots are dead, kill the parent package contract automatically
        Session parent = occurrence.getSession();
        boolean anyActive = parent.getOccurrences().stream()
                .anyMatch(o -> o.getStatus() != Session.SessionStatus.CANCELLED && o.getStatus() != Session.SessionStatus.REJECTED);

        if (!anyActive) {
            parent.setStatus(Session.SessionStatus.CANCELLED);
            sessionRepository.save(parent);
        }
    }

    @Transactional
    public SessionResponse completeSession(Long sessionId, String mentorEmail) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(Session.SessionStatus.COMPLETED);
        Session saved = sessionRepository.save(session);

        notificationService.send(
                session.getStudent().getId(),
                "Session Completed! ⭐ Leave a review",
                "Your session with " + session.getMentor().getFullName() + " is complete.",
                "/student/sessions"
        );

        return toResponse(saved);
    }

    private SessionResponse toResponse(Session s) {
        SessionResponse res = new SessionResponse();
        res.setId(s.getId());
        res.setTopic(s.getTopic());
        res.setMessage(s.getMessage());
        res.setStatus(s.getStatus().name());
        res.setPlanType(s.getPlanType().name());
        res.setTotalOccurrences(s.getTotalOccurrences());
        res.setCreatedAt(s.getCreatedAt());
        res.setScheduledAt(s.getScheduledAt());
        res.setDurationMinutes(s.getDurationMinutes());
        res.setMeetingLink(s.getMeetingLink());
        res.setRejectionReason(s.getRejectionReason()); // FIXED: Direct mapping cleanly integrated
        res.setMentorId(s.getMentor().getId());
        res.setMentorName(s.getMentor().getFullName());
        res.setStudentId(s.getStudent().getId());
        res.setStudentName(s.getStudent().getFullName());

        // Map nested slots arrays cleanly into data carriers for the UI
        if (s.getOccurrences() != null) {
            List<OccurrenceResponse> occList = s.getOccurrences().stream().map(occ -> {
                OccurrenceResponse oRes = new OccurrenceResponse();
                oRes.setId(occ.getId());
                oRes.setScheduledAt(occ.getScheduledAt());
                oRes.setDurationMinutes(occ.getDurationMinutes());
                oRes.setMeetingLink(occ.getMeetingLink());
                oRes.setStatus(occ.getStatus().name()); // Maps the internal child enum securely to its String value for Angular
                return oRes;
            }).collect(Collectors.toList());
            res.setOccurrences(occList);
        }

        return res;
    }
}
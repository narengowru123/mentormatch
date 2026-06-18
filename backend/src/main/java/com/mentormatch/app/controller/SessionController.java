package com.mentormatch.app.controller;

import com.mentormatch.app.dto.ApiResponse;
import com.mentormatch.app.dto.SessionRequest;
import com.mentormatch.app.dto.SessionResponse;
import com.mentormatch.app.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    // POST /api/sessions — Student books a session using original SessionRequest fields
    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> bookSession(
            @Valid @RequestBody SessionRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        SessionResponse session = sessionService.bookSession(request, email);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session booked successfully!", session));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getMySessions(Authentication authentication) {
        String email = authentication.getName();
        List<SessionResponse> sessions = sessionService.getMySessions(email);
        return ResponseEntity.ok(ApiResponse.success("Sessions fetched.", sessions));
    }

    @GetMapping("/mentor")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getMentorSessions(Authentication authentication) {
        String email = authentication.getName();
        List<SessionResponse> sessions = sessionService.getMentorSessions(email);
        return ResponseEntity.ok(ApiResponse.success("Sessions fetched.", sessions));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<SessionResponse>> acceptSession(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String email = authentication.getName();
        String meetingLink = body != null ? body.get("meetingLink") : null;
        SessionResponse session = sessionService.acceptSession(id, email, meetingLink);
        return ResponseEntity.ok(ApiResponse.success("Session accepted.", session));
    }

    // FIXED: Maps body payload using Map<String, String> instead of a missing DTO
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<SessionResponse>> rejectSession(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String email = authentication.getName();
        String reasonText = (body != null && body.containsKey("reason")) ? body.get("reason") : "No reason provided.";

        SessionResponse session = sessionService.rejectSession(id, email, reasonText);
        return ResponseEntity.ok(ApiResponse.success("Session rejected with reason logged.", session));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SessionResponse>> cancelSession(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        SessionResponse session = sessionService.cancelSession(id, email);
        return ResponseEntity.ok(ApiResponse.success("Session cancelled.", session));
    }

    @PatchMapping("/occurrences/{occurrenceId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelIndividualSlot(
            @PathVariable Long occurrenceId,
            Authentication authentication) {

        sessionService.cancelIndividualOccurrence(occurrenceId);
        return ResponseEntity.ok(ApiResponse.success("Target timestamp slot dropped successfully.", null));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<SessionResponse>> completeSession(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        SessionResponse session = sessionService.completeSession(id, email);
        return ResponseEntity.ok(ApiResponse.success("Session completed.", session));
    }
}
package com.mentormatch.app.service;

import com.mentormatch.app.dto.ReviewRequest;
import com.mentormatch.app.dto.ReviewResponse;
import com.mentormatch.app.entity.Review;
import com.mentormatch.app.entity.MentorProfile;
import com.mentormatch.app.entity.Session;
import com.mentormatch.app.entity.User;
import com.mentormatch.app.repository.ReviewRepository;
import com.mentormatch.app.repository.MentorRepository;
import com.mentormatch.app.repository.SessionRepository;
import com.mentormatch.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MentorRepository mentorRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         SessionRepository sessionRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         MentorRepository mentorRepository) {
        this.reviewRepository = reviewRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.mentorRepository = mentorRepository;
    }

    // POST /api/reviews/sessions/{sessionId} — Student submits a review
    @Transactional
    public ReviewResponse submitReview(Long sessionId, ReviewRequest request, String reviewerEmail) {

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // VALIDATE: session must be COMPLETED
        if (session.getStatus() != Session.SessionStatus.COMPLETED) {
            throw new RuntimeException("You can only leave a review after the session is completed.");
        }

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // VALIDATE: only the student of this session can review
        if (!session.getStudent().getId().equals(reviewer.getId())) {
            throw new RuntimeException("Only the student of this session can leave a review.");
        }

        // VALIDATE: prevent duplicate reviews
        boolean alreadyReviewed = reviewRepository.existsBySessionIdAndReviewerId(
                sessionId, reviewer.getId());
        if (alreadyReviewed) {
            throw new RuntimeException("You have already submitted a review for this session.");
        }

        User reviewee = session.getMentor();

        Review review = new Review();
        review.setSession(session);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewerRole(Review.ReviewerRole.STUDENT);

        Review saved = reviewRepository.save(review);

        // Recalculate and persist the mentor's average rating
        MentorProfile mentorProfile = mentorRepository.findByUserId(reviewee.getId())
                .orElseThrow(() -> new RuntimeException("Mentor profile not found for user: " + reviewee.getId()));
        Double avgRating = reviewRepository.calculateAvgRatingForMentor(reviewee.getId());
        mentorProfile.setRating(avgRating != null ? avgRating : 0.0);
        mentorRepository.save(mentorProfile);

        notificationService.send(
                reviewee.getId(),
                "New Review Received!",
                reviewer.getFullName() + " gave you " + request.getRating() + " stars for: " + session.getTopic(),
                "/mentor/dashboard"
        );

        return toResponse(saved);
    }

    // GET /api/reviews/my — Mentor gets their own reviews using JWT email
    @Transactional
    public List<ReviewResponse> getMyReviews(String mentorEmail) {
        System.out.println("=== getMyReviews called for: " + mentorEmail);

        User mentor = userRepository.findByEmail(mentorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + mentorEmail));

        System.out.println("=== Mentor found: " + mentor.getId());

        List<Review> reviews = reviewRepository.findByRevieweeId(mentor.getId());
        System.out.println("=== Reviews found: " + reviews.size());

        List<ReviewResponse> result = new java.util.ArrayList<>();
        for (Review r : reviews) {
            System.out.println("=== Processing review id: " + r.getId());
            try {
                result.add(toResponse(r));
                System.out.println("=== Review mapped OK");
            } catch (Exception e) {
                System.out.println("=== Error mapping review: " + e.getMessage());
                e.printStackTrace();
            }
        }
        return result;
    }

    // GET /api/reviews/mentors/{mentorProfileId} — public profile view
    // Translates the MentorProfile ID into the correct User ID before querying
    @Transactional
    public List<ReviewResponse> getMentorReviews(Long mentorProfileId) {
        MentorProfile mentorProfile = mentorRepository.findById(mentorProfileId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found for ID: " + mentorProfileId));

        return reviewRepository.findByRevieweeId(mentorProfile.getUser().getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // GET /api/reviews/sessions/{sessionId}
    @Transactional
    public List<ReviewResponse> getSessionReviews(Long sessionId) {
        return reviewRepository.findBySessionId(sessionId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse toResponse(Review r) {
        ReviewResponse res = new ReviewResponse();
        res.setId(r.getId());
        res.setRating(r.getRating());
        res.setComment(r.getComment());
        res.setReviewerName(r.getReviewer().getFullName());
        res.setSessionId(r.getSession().getId());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}
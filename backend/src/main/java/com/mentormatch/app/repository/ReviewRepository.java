package com.mentormatch.app.repository;

import com.mentormatch.app.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Get all reviews for a mentor (by reviewee user id)
    List<Review> findByRevieweeId(Long revieweeId);

    // Get all reviews written by a reviewer
    List<Review> findByReviewerId(Long reviewerId);

    // Check if a student already reviewed a specific session
    boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId);

    // Get reviews for a specific session
    // Get reviews for a specific session
    List<Review> findBySessionId(Long sessionId);

    // Calculate average rating for a mentor
    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :mentorId")
    Double calculateAvgRatingForMentor(@org.springframework.data.repository.query.Param("mentorId") Long mentorId);
}
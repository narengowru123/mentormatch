package com.mentormatch.app.repository;

import com.mentormatch.app.entity.SessionOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionOccurrenceRepository extends JpaRepository<SessionOccurrence, Long> {

    // Finds all broken down date slots linked to a specific parent contract package
    @Query("SELECT o FROM SessionOccurrence o WHERE o.session.id = :sessionId ORDER BY o.scheduledAt ASC")
    List<SessionOccurrence> findBySessionId(@Param("sessionId") Long sessionId);
}
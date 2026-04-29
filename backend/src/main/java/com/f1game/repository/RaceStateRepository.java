package com.f1game.repository;

import com.f1game.entity.RaceState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RaceStateRepository extends JpaRepository<RaceState, Long> {
    Optional<RaceState> findBySessionId(String sessionId);
}
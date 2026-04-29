package com.f1game.controller;

import com.f1game.dto.DecisionRequest;
import com.f1game.dto.RaceStateResponse;
import com.f1game.dto.StartRequest;
import com.f1game.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping("/start")
    public ResponseEntity<?> startGame(@RequestBody StartRequest request) {
        try {
            RaceStateResponse response = gameService.startGame(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error starting game: " + e.getMessage());
        }
    }

    @PostMapping("/decision")
    public ResponseEntity<?> processDecision(@RequestBody DecisionRequest request) {
        try {
            RaceStateResponse response = gameService.processDecision(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing decision: " + e.getMessage());
        }
    }

    @GetMapping("/state")
    public ResponseEntity<?> getState(@RequestParam String sessionId) {
        try {
            RaceStateResponse response = gameService.getState(sessionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting state: " + e.getMessage());
        }
    }
}
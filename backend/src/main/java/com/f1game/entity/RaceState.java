package com.f1game.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "race_state")
public class RaceState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;
    private Integer currentLap;
    private Integer totalLaps;
    private Integer position;
    private String lapTime;
    private String tyre;
    private Integer tyreWear;
    private String weather;
    private String carStatus;
    private String strategy;
    private String gapFront;
    private String gapBack;

    @Column(columnDefinition = "TEXT")
    private String raceOrderJson;

    @Column(columnDefinition = "TEXT")
    private String standingsJson;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }

    public RaceState() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Integer getCurrentLap() { return currentLap; }
    public void setCurrentLap(Integer currentLap) { this.currentLap = currentLap; }
    public Integer getTotalLaps() { return totalLaps; }
    public void setTotalLaps(Integer totalLaps) { this.totalLaps = totalLaps; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public String getLapTime() { return lapTime; }
    public void setLapTime(String lapTime) { this.lapTime = lapTime; }
    public String getTyre() { return tyre; }
    public void setTyre(String tyre) { this.tyre = tyre; }
    public Integer getTyreWear() { return tyreWear; }
    public void setTyreWear(Integer tyreWear) { this.tyreWear = tyreWear; }
    public String getWeather() { return weather; }
    public void setWeather(String weather) { this.weather = weather; }
    public String getCarStatus() { return carStatus; }
    public void setCarStatus(String carStatus) { this.carStatus = carStatus; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    public String getGapFront() { return gapFront; }
    public void setGapFront(String gapFront) { this.gapFront = gapFront; }
    public String getGapBack() { return gapBack; }
    public void setGapBack(String gapBack) { this.gapBack = gapBack; }
    public String getRaceOrderJson() { return raceOrderJson; }
    public void setRaceOrderJson(String raceOrderJson) { this.raceOrderJson = raceOrderJson; }
    public String getStandingsJson() { return standingsJson; }
    public void setStandingsJson(String standingsJson) { this.standingsJson = standingsJson; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
package com.f1game.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "standings")
public class Standing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String driverName;
    private String team;
    private Integer points;
    private Integer wins;
    private Integer position;

    public Standing() {}

    public Standing(String driverName, String team, Integer points, Integer wins, Integer position) {
        this.driverName = driverName;
        this.team = team;
        this.points = points;
        this.wins = wins;
        this.position = position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
    public Integer getWins() { return wins; }
    public void setWins(Integer wins) { this.wins = wins; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
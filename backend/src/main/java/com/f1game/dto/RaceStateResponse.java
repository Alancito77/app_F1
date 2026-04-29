package com.f1game.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class RaceStateResponse {
    private Integer lap;
    private Integer position;
    @JsonProperty("lap_time")
    private String lapTime;
    private String tyre;
    @JsonProperty("tyre_wear")
    private Integer tyreWear;
    private String weather;
    @JsonProperty("car_status")
    private String carStatus;
    private String strategy;
    @JsonProperty("gap_front")
    private String gapFront;
    @JsonProperty("gap_back")
    private String gapBack;
    @JsonProperty("race_order")
    private List<String> raceOrder;
    private List<StandingDto> standings;

    public RaceStateResponse() {}

    public Integer getLap() { return lap; }
    public void setLap(Integer lap) { this.lap = lap; }
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
    public List<String> getRaceOrder() { return raceOrder; }
    public void setRaceOrder(List<String> raceOrder) { this.raceOrder = raceOrder; }
    public List<StandingDto> getStandings() { return standings; }
    public void setStandings(List<StandingDto> standings) { this.standings = standings; }

    public static class StandingDto {
        private String driverName;
        private String team;
        private Integer points;
        private Integer wins;
        private Integer position;

        public StandingDto() {}

        public StandingDto(String driverName, String team, Integer points, Integer wins, Integer position) {
            this.driverName = driverName;
            this.team = team;
            this.points = points;
            this.wins = wins;
            this.position = position;
        }

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
}
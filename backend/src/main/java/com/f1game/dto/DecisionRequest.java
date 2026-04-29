package com.f1game.dto;

public class DecisionRequest {
    private String sessionId;
    private Integer lap;
    private String tyre;
    private String strategy;
    private String weather;

    public DecisionRequest() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Integer getLap() { return lap; }
    public void setLap(Integer lap) { this.lap = lap; }
    public String getTyre() { return tyre; }
    public void setTyre(String tyre) { this.tyre = tyre; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    public String getWeather() { return weather; }
    public void setWeather(String weather) { this.weather = weather; }
}
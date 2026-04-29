package com.f1game.service;

import com.f1game.dto.DecisionRequest;
import com.f1game.dto.RaceStateResponse;
import com.f1game.dto.StartRequest;
import com.f1game.entity.RaceState;
import com.f1game.entity.Standing;
import com.f1game.repository.RaceStateRepository;
import com.f1game.repository.StandingRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class GameService {

    @Autowired
    private RaceStateRepository raceStateRepository;

    @Autowired
    private StandingRepository standingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String[] TYRE_TYPES = {"SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"};
    private static final String[] WEATHER_TYPES = {"DRY", "LIGHT_RAIN", "HEAVY_RAIN"};
    private static final String[] CAR_STATUS = {"OK", "DAMAGED", "PIT_NEXT_LAP"};

    @Transactional
    public RaceStateResponse startGame(StartRequest request) {
        String sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID().toString();
        int totalLaps = request.getTotalLaps() != null ? request.getTotalLaps() : 55;

        Optional<RaceState> existing = raceStateRepository.findBySessionId(sessionId);
        if (existing.isPresent()) {
            raceStateRepository.delete(existing.get());
        }

        RaceState state = new RaceState();
        state.setSessionId(sessionId);
        state.setCurrentLap(0);
        state.setTotalLaps(totalLaps);
        state.setPosition(10);
        state.setLapTime("1:28.500");
        state.setTyre("MEDIUM");
        state.setTyreWear(0);
        state.setWeather("DRY");
        state.setCarStatus("OK");
        state.setStrategy("ONE_STOP");
        state.setGapFront("+0.000");
        state.setGapBack("+0.000");

        List<String> raceOrder = generateInitialRaceOrder(request.getDriverName());
        state.setRaceOrderJson(toJson(raceOrder));

        if (standingRepository.count() == 0) {
            initializeStandings();
        }

        state = raceStateRepository.save(state);
        return buildResponse(state);
    }

    @Transactional
    public RaceStateResponse processDecision(DecisionRequest request) {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isEmpty()) {
            throw new IllegalArgumentException("sessionId is required");
        }

        RaceState state = raceStateRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("No active race found for session: " + sessionId));

        int newLap = request.getLap() != null ? request.getLap() : state.getCurrentLap() + 1;

        if (newLap > state.getTotalLaps()) {
            return buildResponse(state);
        }

        state.setCurrentLap(newLap);

        if (request.getTyre() != null && !request.getTyre().isEmpty()) {
            state.setTyre(request.getTyre().toUpperCase());
            state.setTyreWear(0);
        }

        if (request.getStrategy() != null && !request.getStrategy().isEmpty()) {
            state.setStrategy(request.getStrategy().toUpperCase());
        }

        if (request.getWeather() != null && !request.getWeather().isEmpty()) {
            state.setWeather(request.getWeather().toUpperCase());
        }

        int baseWear = getTyreWearRate(state.getTyre(), state.getWeather());
        int currentWear = state.getTyreWear() + baseWear;
        state.setTyreWear(Math.min(currentWear, 100));

        String lapTime = calculateLapTime(state.getTyre(), state.getTyreWear(), state.getWeather());
        state.setLapTime(lapTime);

        int positionChange = calculatePositionChange(lapTime, state.getPosition());
        int newPosition = Math.max(1, Math.min(20, state.getPosition() + positionChange));
        state.setPosition(newPosition);

        state.setGapFront(calculateGap(newPosition, true));
        state.setGapBack(calculateGap(newPosition, false));

        if (state.getTyreWear() >= 90) {
            state.setCarStatus("PIT_NEXT_LAP");
        } else {
            state.setCarStatus("OK");
        }

        updateRaceOrder(state, newPosition);
        updateStandings(state);

        state = raceStateRepository.save(state);
        return buildResponse(state);
    }

    public RaceStateResponse getState(String sessionId) {
        RaceState state = raceStateRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("No active race found for session: " + sessionId));
        return buildResponse(state);
    }

    private String calculateLapTime(String tyre, int wear, String weather) {
        double baseTime = 88.0;
        switch (tyre.toUpperCase()) {
            case "SOFT": baseTime = 87.0; break;
            case "MEDIUM": baseTime = 88.0; break;
            case "HARD": baseTime = 89.5; break;
            case "INTERMEDIATE": baseTime = 92.0; break;
            case "WET": baseTime = 95.0; break;
        }
        double wearPenalty = (wear / 100.0) * 2.5;
        double weatherPenalty = "LIGHT_RAIN".equals(weather) ? 3.0 : "HEAVY_RAIN".equals(weather) ? 6.0 : 0.0;
        double totalSeconds = baseTime + wearPenalty + weatherPenalty;
        return formatLapTime(totalSeconds);
    }

    private int getTyreWearRate(String tyre, String weather) {
        int rate = 0;
        switch (tyre.toUpperCase()) {
            case "SOFT": rate = 8; break;
            case "MEDIUM": rate = 5; break;
            case "HARD": rate = 3; break;
            case "INTERMEDIATE": rate = 6; break;
            case "WET": rate = 4; break;
        }
        if ("LIGHT_RAIN".equals(weather)) rate += 2;
        if ("HEAVY_RAIN".equals(weather)) rate += 4;
        return rate;
    }

    private int calculatePositionChange(String lapTime, int currentPosition) {
        double seconds = parseLapTime(lapTime);
        if (seconds < 88.0) return -1;
        if (seconds > 90.5) return 1;
        return 0;
    }

    private String calculateGap(int position, boolean front) {
        if (position <= 1 && front) return "+0.000";
        if (position >= 20 && !front) return "+0.000";
        double gap = 0.3 + Math.random() * 1.2;
        return String.format("+%.3f", gap);
    }

    private List<String> generateInitialRaceOrder(String driverName) {
        List<String> order = new ArrayList<>(Arrays.asList(
                "VERSTAPPEN", "LECLERC", "HAMILTON", "NORRIS", "PIASTRI",
                "RUSSELL", "ALONSO", "SAINZ", "PERES", "ALBON"
        ));
        if (driverName != null && !driverName.isEmpty()) {
            order.add(driverName.toUpperCase());
        } else {
            order.add("PLAYER");
        }
        Collections.shuffle(order);
        return order;
    }

    private void updateRaceOrder(RaceState state, int newPosition) {
        List<String> order = parseJson(state.getRaceOrderJson());
        if (order != null && !order.isEmpty()) {
            Collections.shuffle(order);
            if (newPosition <= order.size()) {
                if (!order.contains("PLAYER")) {
                    order.set(newPosition - 1, "PLAYER");
                }
            }
            state.setRaceOrderJson(toJson(order));
        }
    }

    private void updateStandings(RaceState state) {
        if (state.getCurrentLap() == null || state.getCurrentLap() < state.getTotalLaps()) return;
        List<Standing> standings = standingRepository.findAllByOrderByPositionAsc();
        if (!standings.isEmpty()) {
            int points = calculatePoints(state.getPosition());
            for (Standing s : standings) {
                if ("PLAYER".equalsIgnoreCase(s.getDriverName()) || s.getPosition().equals(state.getPosition())) {
                    s.setPoints(s.getPoints() + points);
                    if (state.getPosition() == 1) s.setWins(s.getWins() + 1);
                    standingRepository.save(s);
                    break;
                }
            }
        }
    }

    private int calculatePoints(int position) {
        int[] pointsTable = {25, 18, 15, 12, 10, 8, 6, 4, 2, 1};
        return position >= 1 && position <= 10 ? pointsTable[position - 1] : 0;
    }

    private void initializeStandings() {
        List<Standing> standings = Arrays.asList(
                new Standing("VERSTAPPEN", "Red Bull", 0, 0, 1),
                new Standing("LECLERC", "Ferrari", 0, 0, 2),
                new Standing("HAMILTON", "Mercedes", 0, 0, 3),
                new Standing("NORRIS", "McLaren", 0, 0, 4),
                new Standing("PIASTRI", "McLaren", 0, 0, 5),
                new Standing("RUSSELL", "Mercedes", 0, 0, 6),
                new Standing("ALONSO", "Aston Martin", 0, 0, 7),
                new Standing("SAINZ", "Ferrari", 0, 0, 8),
                new Standing("PERES", "Red Bull", 0, 0, 9),
                new Standing("ALBON", "Williams", 0, 0, 10),
                new Standing("PLAYER", "Player Team", 0, 0, 11)
        );
        standingRepository.saveAll(standings);
    }

    private RaceStateResponse buildResponse(RaceState state) {
        RaceStateResponse response = new RaceStateResponse();
        response.setLap(state.getCurrentLap());
        response.setPosition(state.getPosition());
        response.setLapTime(state.getLapTime());
        response.setTyre(state.getTyre());
        response.setTyreWear(state.getTyreWear());
        response.setWeather(state.getWeather());
        response.setCarStatus(state.getCarStatus());
        response.setStrategy(state.getStrategy());
        response.setGapFront(state.getGapFront());
        response.setGapBack(state.getGapBack());
        response.setRaceOrder(parseJson(state.getRaceOrderJson()));

        List<Standing> standings = standingRepository.findAllByOrderByPositionAsc();
        List<RaceStateResponse.StandingDto> standingDtos = new ArrayList<>();
        for (Standing s : standings) {
            standingDtos.add(new RaceStateResponse.StandingDto(
                    s.getDriverName(), s.getTeam(), s.getPoints(), s.getWins(), s.getPosition()
            ));
        }
        response.setStandings(standingDtos);
        return response;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T parseJson(String json) {
        try {
            return (T) objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return (T) new ArrayList<>();
        }
    }

    private double parseLapTime(String lapTime) {
        try {
            String[] parts = lapTime.split(":");
            return Integer.parseInt(parts[0]) * 60.0 + Double.parseDouble(parts[1]);
        } catch (Exception e) {
            return 90.0;
        }
    }

    private String formatLapTime(double totalSeconds) {
        int minutes = (int) (totalSeconds / 60);
        double seconds = totalSeconds % 60;
        return String.format("%d:%06.3f", minutes, seconds);
    }
}
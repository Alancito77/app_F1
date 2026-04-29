// ===== F1 STRATEGY COMMAND — FULL OFFLINE PRO =====

let gameState = {
  team: '', driver: '',
  lap: 0, position: 6,
  tyre: 'medium', tyre_wear: 100,
  weather: 'soleado',
  strategy: 'balanceada',
  circuit: '',
  safetyCar: false,
  lastEvent: null,
  fuel: 100,
  car_status: "normal",
  objective: "Termina en el Top 5"
};

let selectedTeam = null;

// ===== TEAM SELECT =====
document.querySelectorAll('.team-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTeam = btn.dataset.team;
    document.getElementById('driver-select').style.display = 'flex';
  };
});

// ===== START =====
document.getElementById('start-btn').onclick = () => {
  const name = document.getElementById('driver-name').value.trim();
  if (!selectedTeam || !name) return alert("Completa todo");

  gameState.team = selectedTeam;
  gameState.driver = name;

  document.getElementById('intro-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  startRace();
};

// ===== RESTART =====
document.getElementById('restart-btn').onclick = () => location.reload();

// ===== START RACE =====
function startRace() {
  gameState.lap = 0;
  gameState.circuit = randomCircuit();
  nextLap();
}

// ===== LOOP =====
function nextLap(decision = null) {
  gameState.lap++;

  applyDecision(decision);
  simulateEvents();
  updateTyres();
  updateFuel();
  updatePosition();

  const data = buildData();
  processGameData(data);
}

// ===== DECISION =====
function applyDecision(decision) {
  if (!decision) return;

  switch (decision.key) {
    case "A": gameState.strategy = 'agresiva'; break;
    case "B": gameState.strategy = 'conservadora'; break;
    case "C": gameState.strategy = 'balanceada'; break;
    case "D":
      gameState.tyre = pickTyre();
      gameState.tyre_wear = 100;
      gameState.position += 2;
      gameState.lastEvent = "pit";
      break;
  }
}

// ===== EVENTOS =====
function simulateEvents() {
  const r = Math.random();
  gameState.lastEvent = null;

  if (r < 0.1) {
    gameState.safetyCar = true;
    gameState.lastEvent = "safety";
  } else if (r < 0.2) {
    gameState.weather = 'lluvia ligera';
    gameState.lastEvent = "rain";
  } else if (r < 0.3) {
    gameState.lastEvent = "error";
  } else {
    gameState.safetyCar = false;
    gameState.weather = 'soleado';
  }

  // daño mecánico
  if (Math.random() < 0.08) {
    gameState.car_status = "dañado leve";
    gameState.lastEvent = "damage";
  } else {
    gameState.car_status = "normal";
  }
}

// ===== NEUMÁTICOS =====
function updateTyres() {
  let base = { soft: 24, medium: 16, hard: 10 }[gameState.tyre];

  if (gameState.strategy === 'agresiva') base += 5;
  if (gameState.strategy === 'conservadora') base -= 4;
  if (gameState.weather.includes('lluvia')) base += 6;

  gameState.tyre_wear -= base;
  if (gameState.tyre_wear < 0) gameState.tyre_wear = 0;
}

// ===== COMBUSTIBLE =====
function updateFuel() {
  let usage = 8;

  if (gameState.strategy === 'agresiva') usage += 3;
  if (gameState.strategy === 'conservadora') usage -= 2;

  gameState.fuel -= usage;
  if (gameState.fuel < 0) gameState.fuel = 0;
}

// ===== POSICIÓN =====
function updatePosition() {
  let change = 0;

  if (gameState.strategy === 'agresiva') change -= Math.random() < 0.7 ? 2 : -1;
  if (gameState.strategy === 'conservadora') change += Math.random() < 0.5 ? 1 : 0;

  if (gameState.lastEvent === "error") change += 2;
  if (gameState.tyre_wear < 30) change += 2;
  if (gameState.safetyCar) change = Math.floor(Math.random() * 2);

  if (gameState.weather.includes("lluvia") && gameState.tyre !== "inter") {
    change += 3;
  }

  gameState.position += change;

  if (gameState.position < 1) gameState.position = 1;
  if (gameState.position > 20) gameState.position = 20;
}

// ===== DATA =====
function buildData() {
  return {
    lap: gameState.lap,
    position: gameState.position,
    tyre: gameState.tyre,
    tyre_wear: Math.round(gameState.tyre_wear),
    weather: gameState.weather,
    strategy: gameState.strategy,
    circuit: gameState.circuit,
    narrative: generateNarrative(),
    engineer: engineerMsg(),
    driverMsg: driverMsg(),
    decisions: gameState.lap < 5 ? generateDecisions() : [],
    race_order: generateRaceOrder(),
    race_finished: gameState.lap >= 5,
    finish_message: finishText()
  };
}

// ===== NARRATIVA =====
function generateNarrative() {
  let text = "";

  if (gameState.lastEvent === "safety") text += "🚨 Safety Car en pista.\n";
  if (gameState.lastEvent === "rain") text += "🌧️ Lluvia complica la carrera.\n";
  if (gameState.lastEvent === "error") text += "⚠️ Error del piloto.\n";
  if (gameState.lastEvent === "damage") text += "🔧 Daños leves en el coche.\n";
  if (gameState.lastEvent === "pit") text += "🔧 Parada en pits.\n";

  if (gameState.fuel < 25) text += "⛽ Combustible bajo.\n";
  if (gameState.tyre_wear < 25) text += "🔥 Neumáticos críticos.\n";

  const dynamic = [
    "Gran adelantamiento.",
    "Defiende con todo.",
    "Pierde tracción.",
    "Buen ritmo constante.",
    "Presión del rival."
  ];

  text += dynamic[Math.floor(Math.random() * dynamic.length)];

  return text;
}

// ===== MENSAJES =====
function engineerMsg() {
  if (gameState.fuel < 30) return "Ahorra combustible.";
  if (gameState.tyre_wear < 30) return "Neumáticos muy desgastados.";
  if (gameState.weather.includes("lluvia")) return "Box ahora.";
  if (gameState.car_status !== "normal") return "Coche dañado.";

  const msgs = ["Buen ritmo.", "Sigue así.", "Podemos atacar.", "Gestiona bien."];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function driverMsg() {
  const msgs = [
    "Los neumáticos no aguantan.",
    "Tengo buen ritmo.",
    "El coche va bien.",
    "Necesito agarre."
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ===== DECISIONES =====
function generateDecisions() {
  return [
    { key: "A", text: "Atacar fuerte" },
    { key: "B", text: "Conservar neumáticos" },
    { key: "C", text: "Mantener ritmo" },
    { key: "D", text: "Entrar a pits" }
  ];
}

// ===== ORDEN =====
function generateRaceOrder() {
  let arr = [];
  for (let i = 1; i <= 10; i++) {
    arr.push({
      pos: i,
      name: "Piloto " + i,
      is_player: i === gameState.position
    });
  }
  return arr;
}

// ===== CIRCUITO =====
function randomCircuit() {
  const c = ["Mónaco","Spa","Monza","Suzuka","Silverstone"];
  return c[Math.floor(Math.random() * c.length)];
}

// ===== NEUMÁTICO =====
function pickTyre() {
  const t = ["soft","medium","hard"];
  return t[Math.floor(Math.random() * t.length)];
}

// ===== FINAL =====
function finishText() {
  if (gameState.lap < 5) return null;

  if (gameState.position <= 3) return "🏆 ¡Podio increíble!";
  if (gameState.position <= 5) return "🎯 Objetivo cumplido.";
  return "❌ No se logró el objetivo.";
}

// ===== UI =====
function processGameData(data) {
  updateHUD(data);
  updateStatus(data);
  appendNarrative(data);
  updateRaceOrder(data.race_order);

  if (data.race_finished) {
    setTimeout(() => showFinish(data), 1000);
  } else {
    showDecisions(data.decisions);
  }
}

function updateHUD(data) {
  document.getElementById('hud-lap').textContent = data.lap;
  document.getElementById('hud-pos').textContent = data.position;
}

function updateStatus(data) {
  document.getElementById('tyre-badge').textContent = data.tyre.toUpperCase();
  document.getElementById('wear-bar').style.width = data.tyre_wear + "%";
  document.getElementById('wear-val').textContent = data.tyre_wear + "%";
  document.getElementById('clima-val').textContent = data.weather;
  document.getElementById('circuit-name').textContent = data.circuit;

  document.getElementById('strategy-val').textContent =
    data.strategy + " | ⛽ " + Math.round(gameState.fuel) + "% | 🎯 " + gameState.objective;
}

function appendNarrative(data) {
  const el = document.getElementById('narrative-text');
  el.innerHTML += `
    <p><strong>V${data.lap}:</strong> ${data.narrative}</p>
    <p>📻 Ingeniero: ${data.engineer}</p>
    <p>🎙️ ${gameState.driver}: ${data.driverMsg}</p>
  `;
  el.scrollTop = el.scrollHeight;
}

function updateRaceOrder(order) {
  const el = document.getElementById('race-order');
  el.innerHTML = '';
  order.forEach(r => {
    const div = document.createElement('div');
    div.textContent = `${r.pos}. ${r.is_player ? "▶ " + gameState.driver : r.name}`;
    el.appendChild(div);
  });
}

function showDecisions(decisions) {
  const area = document.getElementById('decisions-area');
  const btns = document.getElementById('decisions-buttons');
  btns.innerHTML = '';

  decisions.forEach(d => {
    const b = document.createElement('button');
    b.textContent = `${d.key}) ${d.text}`;
    b.onclick = () => nextLap(d);
    btns.appendChild(b);
  });

  area.style.display = 'block';
}

function showFinish(data) {
  document.getElementById('finish-pos').textContent = `P${data.position}`;
  document.getElementById('finish-msg').textContent = data.finish_message;
  document.getElementById('finish-screen').style.display = 'flex';
}

// ===== F1 STRATEGY COMMAND — GAME ENGINE =====

const SYSTEM_PROMPT = `Eres el motor de un videojuego de estrategia de Fórmula 1. Tu rol es simular una carrera completa donde el usuario es el jefe de estrategia. Cada carrera consta de 5 vueltas, con pista elegida al azar.

REGLAS ESTRICTAS:
- Responde SIEMPRE en formato JSON válido, sin texto extra, sin backticks.
- No avances la historia sin que el usuario elija.
- Mantén coherencia total durante toda la carrera.
- Haz cada vuelta diferente e interesante.
- Usa tono de comentarista deportivo emocionante.
- Incluye mensajes del ingeniero (engineer_msg) y del piloto (driver_msg) cuando sea apropiado.

FORMATO DE RESPUESTA JSON:
{
  "lap": número,
  "position": número (1-20),
  "tyre": "soft" | "medium" | "hard" | "wet" | "inter",
  "tyre_wear": número (0-100, donde 100=nuevo, 0=destruido),
  "weather": "soleado" | "nublado" | "lluvia ligera" | "lluvia intensa",
  "car_status": "normal" | "dañado leve" | "dañado severo" | "fallo mecánico",
  "strategy": "agresiva" | "balanceada" | "conservadora",
  "gap_front": string (ej: "+1.2s" o "LÍDER"),
  "gap_back": string (ej: "+0.8s"),
  "circuit": string (nombre del circuito, solo en vuelta 1),
  "narrative": string (narración emocionante de la vuelta, puede incluir HTML básico),
  "event": null | { "type": "safety_car" | "lluvia" | "accidente" | "error_piloto" | "sc_end" | "virtual_sc", "description": string },
  "engineer_msg": null | string,
  "driver_msg": null | string,
  "decisions": [
    { "key": "A", "text": string },
    { "key": "B", "text": string },
    { "key": "C", "text": string (opcional) },
    { "key": "D", "text": string (opcional) }
  ],
  "race_order": [
    { "pos": número, "name": string, "is_player": bool }
  ],
  "race_finished": false,
  "finish_message": null
}

Cuando race_finished sea true, incluye finish_message con un resumen dramático y no incluyas decisions.

CIRCUITOS DISPONIBLES (elige uno al azar en vuelta 1):
- Mónaco (dificultad: EXTREMA, calles estrechas, difícil adelantar, lluvia muy peligrosa)
- Spa-Francorchamps (dificultad: ALTA, clima impredecible, lluvia frecuente, Eau Rouge peligrosa)
- Monza (dificultad: MEDIA, alta velocidad, batallas de slipstream, estrategia 1-stop)
- Suzuka (dificultad: ALTA, técnico, neumáticos críticos, sector 1 exigente)
- Interlagos (dificultad: MEDIA, lluvia posible, buenas oportunidades de adelantamiento)
- Singapur (dificultad: ALTA, calles urbanas, safety car frecuente, calor extremo)
- Silverstone (dificultad: MEDIA, clima inglés cambiante, alta velocidad)
- Zandvoort (dificultad: MEDIA-ALTA, curvas peraltadas, difícil adelantar)

PROBABILIDADES DE EVENTOS POR VUELTA:
- Safety Car: 8%
- Lluvia repentina: 12%
- Accidente: 6%
- Error del piloto: 10%

LÓGICA DE JUEGO:
- Las decisiones buenas mejoran posición o preservan neumáticos
- Las decisiones malas causan pérdida de posiciones o daño
- El desgaste de neumáticos se acumula cada vuelta (10-25 puntos dependiendo del compuesto y ritmo)
- Soft se desgasta 20-25pts/vuelta, Medium 12-18pts/vuelta, Hard 8-12pts/vuelta
- Con desgaste <30%, el piloto pierde rendimiento significativamente
- La lluvia hace los neumáticos secos peligrosos (mayor desgaste, posible accidente)
- Los wet/inter son lentos en seco`;

// ===== STATE =====
let gameState = {
  team: '',
  teamColor: '',
  teamAccent: '',
  driver: '',
  lap: 0,
  position: 6,
  tyre: 'medium',
  tyre_wear: 100,
  weather: 'soleado',
  car_status: 'normal',
  strategy: 'balanceada',
  gap_front: '+2.4s',
  gap_back: '+1.8s',
  circuit: '',
  conversationHistory: [],
  raceFinished: false
};

let selectedTeam = null;

// ===== TEAM SELECT =====
document.querySelectorAll('.team-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTeam = {
      name: btn.dataset.team,
      color: btn.dataset.color,
      accent: btn.dataset.accent
    };
    document.getElementById('driver-select').style.display = 'flex';
    // Update team color preview
    document.documentElement.style.setProperty('--team-color', btn.dataset.color);
    document.documentElement.style.setProperty('--team-accent', btn.dataset.accent);
  });
});

// ===== START GAME =====
document.getElementById('start-btn').addEventListener('click', () => {
  const driverInput = document.getElementById('driver-name').value.trim();
  if (!selectedTeam) { alert('Selecciona un equipo'); return; }
  if (!driverInput) { alert('Ingresa el nombre del piloto'); return; }

  gameState.team = selectedTeam.name;
  gameState.teamColor = selectedTeam.color;
  gameState.teamAccent = selectedTeam.accent;
  gameState.driver = driverInput;

  document.documentElement.style.setProperty('--team-color', selectedTeam.color);
  document.documentElement.style.setProperty('--team-accent', selectedTeam.accent);

  document.getElementById('intro-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  document.getElementById('hud-team-name').textContent = selectedTeam.name.toUpperCase();

  startRace();
});

// ===== RESTART =====
document.getElementById('restart-btn').addEventListener('click', () => {
  gameState = {
    team: '', teamColor: '', teamAccent: '', driver: '',
    lap: 0, position: 6, tyre: 'medium', tyre_wear: 100,
    weather: 'soleado', car_status: 'normal', strategy: 'balanceada',
    gap_front: '+2.4s', gap_back: '+1.8s', circuit: '',
    conversationHistory: [], raceFinished: false
  };
  selectedTeam = null;
  document.getElementById('finish-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('intro-screen').style.display = 'flex';
  document.getElementById('driver-select').style.display = 'none';
  document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('driver-name').value = '';
  document.getElementById('narrative-text').innerHTML = `<div class="loading-msg"><div class="spinner"></div><span>Conectando con el muro de boxes...</span></div>`;
  document.getElementById('history-log').innerHTML = '';
  document.getElementById('race-order').innerHTML = '';
});

// ===== START RACE =====
async function startRace() {
  const firstPrompt = `Inicia la simulación para el equipo ${gameState.team} con el piloto ${gameState.driver}.
Vuelta 1 de 5. Posición inicial: 6. Neumáticos: medium (desgaste 100). Clima: soleado.
Elige un circuito al azar. Narra la salida de la carrera de forma emocionante.
Recuerda responder SOLO en JSON válido.`;

  gameState.conversationHistory.push({ role: 'user', content: firstPrompt });
  await fetchAndProcess();
}

// ===== FETCH FROM CLAUDE API =====
async function fetchAndProcess() {
  showLoading(true);
  hideDecisions();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: gameState.conversationHistory
      })
    });

    const data = await response.json();
    const rawText = data.content.map(i => i.text || '').join('');

    // Parse JSON - strip any accidental backticks
    let clean = rawText.replace(/```json|```/g, '').trim();
    // Find first { and last }
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1);

    const gameData = JSON.parse(clean);

    // Add assistant response to history
    gameState.conversationHistory.push({ role: 'assistant', content: rawText });

    processGameData(gameData);

  } catch (err) {
    console.error('API Error:', err);
    showError('Error de comunicación con el muro de boxes. Por favor recarga.');
  } finally {
    showLoading(false);
  }
}

// ===== PROCESS GAME DATA =====
function processGameData(data) {
  // Update state
  gameState.lap = data.lap;
  gameState.position = data.position;
  gameState.tyre = data.tyre;
  gameState.tyre_wear = data.tyre_wear;
  gameState.weather = data.weather;
  gameState.car_status = data.car_status;
  gameState.strategy = data.strategy;
  gameState.gap_front = data.gap_front;
  gameState.gap_back = data.gap_back;
  if (data.circuit) gameState.circuit = data.circuit;

  // Update HUD
  updateHUD(data);

  // Update status panel
  updateStatus(data);

  // Update narrative
  appendNarrative(data);

  // Update race order
  if (data.race_order) updateRaceOrder(data.race_order);

  // Add to history
  addHistory(data);

  // Check finish
  if (data.race_finished) {
    setTimeout(() => showFinish(data), 1500);
    return;
  }

  // Show decisions
  if (data.decisions && data.decisions.length > 0) {
    showDecisions(data.decisions);
  }
}

// ===== UPDATE HUD =====
function updateHUD(data) {
  const lapEl = document.getElementById('hud-lap');
  const posEl = document.getElementById('hud-pos');

  lapEl.textContent = data.lap;
  lapEl.style.animation = 'none';
  setTimeout(() => lapEl.style.animation = '', 10);

  posEl.textContent = data.position;
  // Color by position
  if (data.position === 1) posEl.style.color = '#FFD700';
  else if (data.position <= 3) posEl.style.color = '#C0C0C0';
  else if (data.position <= 10) posEl.style.color = 'var(--soft)';
  else posEl.style.color = 'var(--text-dim)';
}

// ===== UPDATE STATUS =====
function updateStatus(data) {
  // Tyre badge
  const badge = document.getElementById('tyre-badge');
  const tyreNames = { soft:'SOFT', medium:'MEDIUM', hard:'HARD', wet:'WET', inter:'INTER' };
  badge.textContent = tyreNames[data.tyre] || data.tyre.toUpperCase();
  badge.className = 'tyre-badge ' + data.tyre;

  // Wear bar
  const wearBar = document.getElementById('wear-bar');
  const wearVal = document.getElementById('wear-val');
  const wear = data.tyre_wear;
  wearBar.style.width = wear + '%';
  wearVal.textContent = wear + '%';

  if (wear > 60) {
    wearBar.style.background = 'var(--medium)';
  } else if (wear > 30) {
    wearBar.style.background = 'var(--soft)';
  } else {
    wearBar.style.background = 'var(--accent)';
  }

  // Weather
  const weatherIcons = {
    'soleado': '☀️ Soleado',
    'nublado': '☁️ Nublado',
    'lluvia ligera': '🌧️ Lluvia Ligera',
    'lluvia intensa': '⛈️ Lluvia Intensa'
  };
  document.getElementById('clima-val').textContent = weatherIcons[data.weather] || data.weather;

  // Car status
  const carIcons = {
    'normal': '✅ Normal',
    'dañado leve': '⚠️ Dañado Leve',
    'dañado severo': '🔴 Dañado Severo',
    'fallo mecánico': '💀 Fallo Mecánico'
  };
  document.getElementById('car-status').textContent = carIcons[data.car_status] || data.car_status;

  // Strategy
  const stratIcons = { 'agresiva': '🔴 Agresiva', 'balanceada': '🟡 Balanceada', 'conservadora': '🟢 Conservadora' };
  document.getElementById('strategy-val').textContent = stratIcons[data.strategy] || data.strategy;

  // Gaps
  document.getElementById('gap-front').textContent = data.gap_front;
  document.getElementById('gap-back').textContent = data.gap_back;

  // Circuit
  if (data.circuit || gameState.circuit) {
    document.getElementById('circuit-name').textContent = data.circuit || gameState.circuit;
  }
}

// ===== APPEND NARRATIVE =====
function appendNarrative(data) {
  const narrativeEl = document.getElementById('narrative-text');

  // Clear loading message on first load
  if (narrativeEl.querySelector('.loading-msg')) {
    narrativeEl.innerHTML = '';
  }

  // Lap header
  const lapHeader = document.createElement('div');
  lapHeader.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:0.2em;margin-bottom:0.5rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);';
  lapHeader.textContent = `── VUELTA ${data.lap} DE 5 ──`;
  narrativeEl.appendChild(lapHeader);

  // Event banner
  if (data.event) {
    const eventBanner = document.createElement('div');
    eventBanner.className = 'event-banner';
    const eventIcons = {
      'safety_car': '🟡 SAFETY CAR',
      'lluvia': '🌧️ LLUVIA REPENTINA',
      'accidente': '🚨 ACCIDENTE',
      'error_piloto': '⚠️ ERROR DEL PILOTO',
      'sc_end': '🟢 SAFETY CAR RETIRADO',
      'virtual_sc': '🟡 SAFETY CAR VIRTUAL'
    };
    eventBanner.textContent = (eventIcons[data.event.type] || '⚡ EVENTO') + ' — ' + data.event.description;
    narrativeEl.appendChild(eventBanner);
  }

  // Narrative text
  const narPara = document.createElement('p');
  narPara.innerHTML = formatNarrative(data.narrative);
  narrativeEl.appendChild(narPara);

  // Engineer msg
  if (data.engineer_msg) {
    const engDiv = document.createElement('div');
    engDiv.className = 'engineer-msg';
    engDiv.textContent = '📻 Ingeniero: "' + data.engineer_msg + '"';
    narrativeEl.appendChild(engDiv);
  }

  // Driver msg
  if (data.driver_msg) {
    const drvDiv = document.createElement('div');
    drvDiv.className = 'pilot-msg';
    drvDiv.textContent = '🎙️ ' + gameState.driver + ': "' + data.driver_msg + '"';
    narrativeEl.appendChild(drvDiv);
  }

  // Scroll to bottom
  narrativeEl.scrollTop = narrativeEl.scrollHeight;
}

function formatNarrative(text) {
  if (!text) return '';
  // Bold key words
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="event-highlight">$1</strong>')
    .replace(/!!/g, '')
    .replace(/\n/g, '<br>');
}

// ===== UPDATE RACE ORDER =====
function updateRaceOrder(order) {
  const el = document.getElementById('race-order');
  el.innerHTML = '';
  order.slice(0, 10).forEach(row => {
    const div = document.createElement('div');
    div.className = 'race-row' + (row.is_player ? ' is-player' : '');
    div.innerHTML = `
      <span class="race-pos">${row.pos}</span>
      <span class="race-driver">${row.is_player ? '▶ ' + gameState.driver : row.name}</span>
    `;
    el.appendChild(div);
  });
}

// ===== ADD HISTORY =====
function addHistory(data) {
  const log = document.getElementById('history-log');
  const entry = document.createElement('div');
  entry.className = 'history-entry';
  entry.innerHTML = `<span class="h-lap">V${data.lap}</span> P${data.position} · ${data.tyre.toUpperCase()} ${data.tyre_wear}%`;
  log.insertBefore(entry, log.firstChild);
}

// ===== SHOW DECISIONS =====
function showDecisions(decisions) {
  const area = document.getElementById('decisions-area');
  const btns = document.getElementById('decisions-buttons');
  btns.innerHTML = '';

  decisions.forEach(dec => {
    const btn = document.createElement('button');
    btn.className = 'decision-btn';
    btn.innerHTML = `<span class="btn-key">${dec.key})</span>${dec.text}`;
    btn.addEventListener('click', () => handleDecision(dec));
    btns.appendChild(btn);
  });

  area.style.display = 'block';
}

function hideDecisions() {
  document.getElementById('decisions-area').style.display = 'none';
}

// ===== HANDLE DECISION =====
async function handleDecision(decision) {
  hideDecisions();

  // Show chosen decision in narrative
  const narrativeEl = document.getElementById('narrative-text');
  const choiceDiv = document.createElement('div');
  choiceDiv.style.cssText = 'font-family:var(--font-mono);font-size:0.75rem;color:var(--accent2);padding:0.4rem 0.75rem;border-left:3px solid var(--accent2);margin:0.5rem 0;';
  choiceDiv.textContent = `► Decisión tomada: ${decision.key}) ${decision.text}`;
  narrativeEl.appendChild(choiceDiv);
  narrativeEl.scrollTop = narrativeEl.scrollHeight;

  // Build next prompt
  const nextLap = gameState.lap + 1;
  const userMsg = `El jefe de estrategia eligió: "${decision.key}) ${decision.text}".

Estado actual tras la decisión:
- Vuelta completada: ${gameState.lap} de 5
- Próxima vuelta: ${nextLap}
- Posición actual: ${gameState.position}
- Neumáticos: ${gameState.tyre} (desgaste: ${gameState.tyre_wear}%)
- Clima: ${gameState.weather}
- Estado coche: ${gameState.car_status}
- Gap delante: ${gameState.gap_front}
- Gap detrás: ${gameState.gap_back}

${nextLap > 5 ? 'Esta era la última vuelta. Finaliza la carrera con race_finished: true y un finish_message épico.' : `Simula la vuelta ${nextLap} con las consecuencias de esta decisión. Responde SOLO en JSON.`}`;

  gameState.conversationHistory.push({ role: 'user', content: userMsg });
  await fetchAndProcess();
}

// ===== SHOW FINISH =====
function showFinish(data) {
  const finishScreen = document.getElementById('finish-screen');
  const pos = data.position;

  const posEmoji = pos === 1 ? '🏆' : pos <= 3 ? '🥈' : pos <= 10 ? '🏅' : '🔧';
  const posText = pos === 1 ? '1er LUGAR' : pos === 2 ? '2do LUGAR' : pos === 3 ? '3er LUGAR' : `${pos}° LUGAR`;

  document.getElementById('finish-pos').textContent = posEmoji + ' ' + posText;
  document.getElementById('finish-msg').textContent = data.finish_message || '¡Carrera completada!';

  finishScreen.style.display = 'flex';
}

// ===== LOADING =====
function showLoading(show) {
  document.getElementById('loading-indicator').style.display = show ? 'flex' : 'none';
}

function showError(msg) {
  const narrativeEl = document.getElementById('narrative-text');
  const errDiv = document.createElement('p');
  errDiv.style.color = 'var(--accent)';
  errDiv.textContent = msg;
  narrativeEl.appendChild(errDiv);
}
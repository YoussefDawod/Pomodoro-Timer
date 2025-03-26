import { useState, useEffect, useRef } from "react";

function App() {
  // State-Variablen für den Timer
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25); // Arbeitszeit
  const [breakMinutes, setBreakMinutes] = useState(5); // Pausenzeit
  const [selectedMethod, setSelectedMethod] = useState("Standard Pomodoro");
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [phaseCount, setPhaseCount] = useState(0); // Zähler für die Phasen
  const [completedPhases, setCompletedPhases] = useState([]); // Liste der abgeschlossenen Phasen
  const [phaseRepetitions, setPhaseRepetitions] = useState(4); // Anzahl der Wiederholungen

  // Methoden für verschiedene Pomodoro-Timer
  const methods = {
    "Standard Pomodoro": { work: 25, break: 5 },
    "Kurze Pomodoro": { work: 15, break: 5 },
    "Lange Pomodoro": { work: 50, break: 10 },
    "2-Phasen Pomodoro": { work: 45, break: 15 },
  };

  // Berechnung der Gesamtzeit und des Fortschritts
  const totalTime = isWorkTime ? workMinutes * 60 : breakMinutes * 60;
  const remainingTime = minutes * 60 + seconds;
  const progress = ((totalTime - remainingTime) / totalTime) * 100;

  // Referenzen für den Startzeitpunkt und das Intervall
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Funktion zum Abspielen eines Sounds
  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio
      .play()
      .catch((error) => console.log("Autoplay wurde blockiert:", error));
  };

  // Effekt, der den Timer im Hintergrund laufen lässt
  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now() - (totalTime - remainingTime) * 1000; // Startzeit setzen
      intervalRef.current = setInterval(() => {
        const elapsedTime = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        const newRemainingTime = totalTime - elapsedTime;

        if (newRemainingTime <= 0) {
          clearInterval(intervalRef.current);
          playSound("/sounds/timer-alarm.wav"); // Sound abspielen

          // Phase abschließen
          const phaseType = isWorkTime ? "Arbeit" : "Pause";
          const phaseDuration = isWorkTime ? workMinutes : breakMinutes;
          setCompletedPhases((prev) => [
            ...prev,
            { type: phaseType, duration: phaseDuration },
          ]); // Phase zur Liste hinzufügen

          if (phaseCount < phaseRepetitions * 2 - 1) {
            // Nächste Phase starten
            setIsWorkTime((prev) => !prev); // Phase wechseln
            setMinutes(isWorkTime ? breakMinutes : workMinutes); // Pausen- oder Arbeitszeit setzen
            setSeconds(0);
            setPhaseCount((prev) => prev + 1); // Phasenzähler erhöhen
            setIsActive(true); // Timer fortsetzen
          } else {
            // Nach den festgelegten Wiederholungen anhalten
            setIsActive(false);
            setPhaseCount(0); // Phasenzähler zurücksetzen
          }
        } else {
          setMinutes(Math.floor(newRemainingTime / 60));
          setSeconds(newRemainingTime % 60);
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [
    isActive,
    isWorkTime,
    totalTime,
    remainingTime,
    phaseCount,
    workMinutes,
    breakMinutes,
    phaseRepetitions,
  ]);

  // Berechnung der Gesamtzeit für Arbeit und Pause
  const totalWorkTime = completedPhases
    .filter((phase) => phase.type === "Arbeit")
    .reduce((sum, phase) => sum + phase.duration, 0);

  const totalBreakTime = completedPhases
    .filter((phase) => phase.type === "Pause")
    .reduce((sum, phase) => sum + phase.duration, 0);

  // Timer starten
  const startTimer = () => {
    setIsActive(true);
  };

  // Timer stoppen
  const stopTimer = () => {
    setIsActive(false);
  };

  // Timer zurücksetzen
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(workMinutes);
    setSeconds(0);
    setIsWorkTime(true);
    setPhaseCount(0);
    setCompletedPhases([]);
  };

  // Arbeitszeit ändern
  const handleWorkMinutesChange = (e) => {
    setWorkMinutes(parseInt(e.target.value, 10));
  };

  // Pausenzeit ändern
  const handleBreakMinutesChange = (e) => {
    setBreakMinutes(parseInt(e.target.value, 10));
  };

  // Anzahl der Wiederholungen ändern
  const handlePhaseRepetitionsChange = (e) => {
    setPhaseRepetitions(parseInt(e.target.value, 10));
  };

  // Benutzerdefinierten Timer anwenden
  const applyCustomTimer = () => {
    setMinutes(workMinutes);
    setSeconds(0);
    setIsActive(false);
  };

  // Methode ändern
  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setWorkMinutes(methods[method].work);
    setBreakMinutes(methods[method].break);
    setPhaseRepetitions(4); // Standardmäßig 4 Wiederholungen für Standardmethoden
  };

  // Dunkelmodus umschalten
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`App`} data-theme={darkMode ? "dark" : "light"}>
      <div className="header">
        <h1>Pomodoro Timer</h1>
        <div className="header-buttons">
          <button onClick={toggleDarkMode}>
            {darkMode ? "Hellmodus" : "Dunkelmodus"}
          </button>
          <select
            value={selectedMethod}
            onChange={(e) => handleMethodChange(e.target.value)}
          >
            {Object.keys(methods).map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="timer">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <div className="phase-indicator">
        {isWorkTime ? "Arbeitszeit" : "Pausenzeit"}
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="custom-timer">
        <div>
          <label>Arbeitszeit (Minuten):</label>
          <input
            type="number"
            value={workMinutes}
            onChange={handleWorkMinutesChange}
            min="1"
          />
        </div>
        <div>
          <label>Pausenzeit (Minuten):</label>
          <input
            type="number"
            value={breakMinutes}
            onChange={handleBreakMinutesChange}
            min="1"
          />
        </div>
        <div>
          <label>Anzahl der Wiederholungen:</label>
          <input
            type="number"
            value={phaseRepetitions}
            onChange={handlePhaseRepetitionsChange}
            min="1"
          />
        </div>
        <button onClick={applyCustomTimer}>Anwenden</button>
      </div>
      <div className="buttons">
        <button onClick={startTimer} disabled={isActive}>
          Start
        </button>
        <button onClick={stopTimer} disabled={!isActive}>
          Stop
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div className="completed-phases">
        <h3>Abgeschlossene Phasen:</h3>
        <div className="completed-phases-list">
          <ul>
            {completedPhases.map((phase, index) => (
              <li key={index}>
                {phase.type}: {phase.duration} Minuten
              </li>
            ))}
          </ul>
        </div>
      </div>
      {completedPhases.length > 0 && (
        <div className="total-time">
          <h3>Gesamtzeit:</h3>
          <p>Gearbeitet: {totalWorkTime} Minuten</p>
          <p>Pause gemacht: {totalBreakTime} Minuten</p>
        </div>
      )}
    </div>
  );
}

export default App;







/* Neue, professionelle Farbpalette im Apple-Stil */
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  
  /* Dark Mode - Elegant und kontrastreich */
  --pri-color: #007AFF;    /* Apple Blau als Akzentfarbe */
  --sec-color: #34C759;    /* Apple Grün */
  --ter-color: #5856D6;    /* Apple Violett */
  --font-color: #F5F5F7;   /* Apple heller Text */
  --font-color-highlight: #FFFFFF;
  --pri-bg-color: #1C1C1E; /* Dunkler Hintergrund */
  --sec-bg-color: #2C2C2E; /* Leicht aufgehellt */
  --ter-bg-color: #3A3A3C; /* Für Eingabefelder */
  --hover-color: rgba(0, 122, 255, 0.1);
  --info-color: #5AC8FA;
  --error-color: #FF3B30;
  --success-color: #34C759;
  --shadow-color: rgba(0, 0, 0, 0.2);
  --text-shadow-color: rgba(0, 0, 0, 0.4);
  --disabled-color: #8E8E93;
  --card-bg: rgba(28, 28, 30, 0.8);
  --card-border: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] {
  /* Light Mode - Hell und luftig */
  --pri-color: #007AFF;
  --sec-color: #34C759;
  --ter-color: #5856D6;
  --font-color: #1C1C1E;
  --font-color-highlight: #000000;
  --pri-bg-color: #F5F5F7;  /* Apple typischer heller Hintergrund */
  --sec-bg-color: #FFFFFF;  /* Reines Weiß für Karten */
  --ter-bg-color: #F2F2F7;  /* Leicht grau für Eingabefelder */
  --hover-color: rgba(0, 122, 255, 0.1);
  --info-color: #5AC8FA;
  --error-color: #FF3B30;
  --success-color: #34C759;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --text-shadow-color: rgba(0, 0, 0, 0.2);
  --disabled-color: #C7C7CC;
  --card-bg: rgba(255, 255, 255, 0.8);
  --card-border: rgba(0, 0, 0, 0.1);
}

/* Allgemeine Stile - Modern und clean */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  font-family: var(--font-family);
  background-color: var(--pri-bg-color);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  color: var(--font-color);
  transition: all 0.3s ease;
}

/* Header - Minimalistisch mit Fokus */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--font-color);
  letter-spacing: -0.5px;
}

.header-buttons button {
  background-color: transparent;
  color: var(--pri-color);
  border: 1px solid var(--pri-color);
  font-size: 1rem;
  font-weight: 500;
  width: auto;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-buttons button:hover {
  background-color: var(--hover-color);
  transform: scale(1.03);
}

/* Benutzerdefinierte Timer-Einstellungen - Karten-Design */
.custom-timer {
  padding: 1.5rem;
  border-radius: 12px;
  background-color: var(--sec-bg-color);
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--card-border);
}

.custom-timer div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-timer label {
  font-size: 1.1rem;
  color: var(--font-color);
  font-weight: 500;
}

.custom-timer input, select {
  padding: 0.75rem;
  border: 1px solid var(--ter-bg-color);
  border-radius: 8px;
  font-size: 1rem;
  width: 100px;
  text-align: center;
  background-color: var(--ter-bg-color);
  color: var(--font-color);
  transition: all 0.2s ease;
  font-weight: 500;
}

.custom-timer input:focus, select:focus {
  border-color: var(--pri-color);
  outline: none;
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007AFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 0.65rem auto;
  padding-right: 2rem;
}

/* Buttons - Modern mit sanften Animationen */
.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.controls button {
  background-color: var(--pri-color);
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.2);
}

.controls button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.controls button:active {
  transform: translateY(0);
}

.controls button:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Timer-Anzeige - Fokuspunkt des Designs */
.timer-display {
  text-align: center;
  margin: 2rem 0;
}

.timer {
  font-size: 5rem;
  font-weight: 300;
  color: var(--font-color);
  letter-spacing: -2px;
  margin: 1rem 0;
  font-variant-numeric: tabular-nums;
}

.phase-indicator {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--pri-color);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Progress-Bar - Subtiler aber informativ */
.progress-bar {
  width: 100%;
  max-width: 500px;
  height: 6px;
  background-color: var(--ter-bg-color);
  border-radius: 3px;
  overflow: hidden;
  margin: 1.5rem 0;
}

.progress {
  height: 100%;
  background-color: var(--pri-color);
  transition: width 0.1s linear;
  border-radius: 3px;
}

/* Statistik - Klare Typografie */
.stats {
  padding: 1.5rem;
  border-radius: 12px;
  background-color: var(--sec-bg-color);
  width: 100%;
  max-width: 600px;
  margin: 1.5rem 0;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--card-border);
}

.stats p {
  font-size: 1.1rem;
  color: var(--font-color);
  margin: 0.5rem 0;
  font-weight: 500;
}

/* Methoden-Buttons - Gleichmäßig verteilt */
.methods {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.methods button {
  background-color: transparent;
  color: var(--pri-color);
  border: 1px solid var(--pri-color);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 180px;
}

.methods button:hover {
  background-color: var(--hover-color);
  transform: scale(1.03);
}

/* Animationen - Subtile Effekte */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .App {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .timer {
    font-size: 4rem;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .methods {
    flex-wrap: wrap;
  }
  
  .methods button {
    max-width: 45%;
  }
}






///////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

/* Farbpaletten */
:root {
  --font-family: "Comic Neue", cursive;

  /* Dark Mode Farben */
  --pri-color: #ff6f61;
  --sec-color: #ff9a8b;
  --ter-color: #ff7e5f;
  --font-color: #f5f5f5;
  --font-color-highlight: #ff6f61;
  --pri-bg-color: #1e1e1e;
  --sec-bg-color: #2a2a2a;
  --ter-bg-color: #3a3a3a;
  --hover-color: #ff9a8b;
  --info-color: #ffa726;
  --error-color: #e53935;
  --success-color: #66bb6a;
  --shadow-color: rgba(255, 111, 97, 0.3);
  --text-shadow-color: rgba(255, 111, 97, 0.5);
  --disabled-color: #666666;
}

[data-theme="light"] {
  /* Light Mode Farben */
  --pri-color: #ff6f61;
  --sec-color: #ff9a8b;
  --ter-color: #ff7e5f;
  --font-color: #333333;
  --font-color-highlight: #ff6f61;
  --pri-bg-color: #ffffff;
  --sec-bg-color: #f0f0f0;
  --ter-bg-color: #e0e0e0;
  --hover-color: #ff9a8b;
  --info-color: #ffa726;
  --error-color: #e53935;
  --success-color: #66bb6a;
  --shadow-color: rgba(255, 111, 97, 0.1);
  --text-shadow-color: rgba(255, 111, 97, 0.2);
  --disabled-color: #cccccc;
}

/* Allgemeine Stile */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.App {
  font-family: var(--font-family);
  background-color: var(--pri-bg-color);
  padding: .5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  color: var(--font-color);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  width: 100%;
  padding: .5rem;
}

.header h1 {
  font-size: 3rem;
  color: var(--font-color);
  text-shadow: 2px 2px 4px var(--text-shadow-color);
}

.header-buttons button {
  background-color: var(--pri-color);
  color: var(--font-color);
  border: none;
  font-size: 1.2rem;
  width: 8rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.header-buttons button:hover {
  background-color: var(--hover-color);
  transform: translateY(-5px);
}

/* Benutzerdefinierte Timer-Einstellungen */
.custom-timer {
  padding: .5rem;
  border: 2px solid var(--pri-color);
  border-radius: .5rem;
  background-color: var(--sec-bg-color);
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
}

.custom-timer div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-timer label {
  font-size: 1.5rem;
  color: var(--font-color);
}

.custom-timer input, select {
  padding: 0.75rem;
  border: 1px solid var(--pri-color);
  border-radius: 0.75rem;
  font-size: 1.2rem;
  width: 7rem;
  text-align: center;
  background-color: var(--ter-bg-color);
  color: var(--font-color);
  transition: border-color 0.3s ease;
}

.custom-timer input:focus, select:focus {
  border-color: var(--hover-color);
}

select {
  font-size: 1rem;
}

/* Buttons */
.controls {
  display: flex;
  justify-content: space-between;
}

.controls button {
  background-color: var(--pri-color);
  color: var(--font-color);
  font-size: 1.5rem;
  border: none;
  padding: 0.75rem;
  width: 7rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.controls button:hover {
  background-color: var(--hover-color);
  transform: translateY(-5px);
}

.controls button:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
}

/* Timer-Anzeige */
.timer-display {
  text-align: center;
}

.timer {
  font-size: 6rem;
  font-weight: bold;
  color: var(--font-color);
  text-shadow: 2px 2px 4px var(--text-shadow-color);
  animation: pulse 2s infinite, glow 1.5s infinite alternate;
}

.phase-indicator {
  font-size: 2rem;
  color: var(--pri-color);
  text-shadow: 1px 1px 2px var(--text-shadow-color);
  animation: fade 2s infinite;
}

/* Progress-Bar */
.progress-bar {
  width: 100%;
  max-width: 900px;
  height: 1.5rem;
  background-color: var(--sec-bg-color);
  border-radius: 1rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: var(--pri-color);
  transition: width 0.1s linear;
  animation: progress-glow 1.5s infinite alternate;
}

/* Statistik */
.stats {
  padding: .5rem;
  border: 2px solid var(--pri-color);
  border-radius: .5rem;
  background-color: var(--sec-bg-color);
  width: 100%;
  max-width: 900px;
}

.stats p {
  font-size: 1.5rem;
  color: var(--font-color);
}

/* Methoden-Buttons */
.methods {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
}

.methods button {
  background-color: var(--pri-color);
  color: var(--font-color);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.methods button:hover {
  background-color: var(--hover-color);
  transform: translateY(-5px);
}

/* Animationen */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes glow {
  0% {
    text-shadow: 0 0 5px var(--pri-color), 0 0 10px var(--pri-color), 0 0 20px var(--pri-color);
  }
  100% {
    text-shadow: 0 0 10px var(--pri-color), 0 0 20px var(--pri-color), 0 0 40px var(--pri-color);
  }
}

@keyframes fade {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

@keyframes progress-glow {
  0% {
    box-shadow: 0 0 5px var(--pri-color), 0 0 10px var(--pri-color);
  }
  100% {
    box-shadow: 0 0 10px var(--pri-color), 0 0 20px var(--pri-color);
  }
}
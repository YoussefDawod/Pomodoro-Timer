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







/* Farbpaletten */
:root {
  --font-family: "Comic Neue", cursive;

  /* Dark Mode Farben */
  --pri-color: #00adb5;
  --sec-color: #71c9ce;
  --ter-color: #393e46;
  --font-color: #eeeeee;
  --font-color-highlight: #00adb5;
  --pri-bg-color: #222831;
  --sec-bg-color: #393e46;
  --ter-bg-color: #454b56;
  --hover-color: #71c9ce;
  --info-color: #29b6f6;
  --error-color: #f44336;
  --success-color: #4caf50;
  --shadow-color: rgba(0, 173, 181, 0.3);
  --text-shadow-color: rgba(0, 173, 181, 0.5);
  --disabled-color: #666666;
}

[data-theme="light"] {
  /* Light Mode Farben */
  --pri-color: #00adb5;
  --sec-color: #71c9ce;
  --ter-color: #393e46;
  --font-color: #333333;
  --font-color-highlight: #00adb5;
  --pri-bg-color: #ffffff;
  --sec-bg-color: #f0f0f0;
  --ter-bg-color: #e0e0e0;
  --hover-color: #71c9ce;
  --info-color: #29b6f6;
  --error-color: #f44336;
  --success-color: #4caf50;
  --shadow-color: rgba(0, 173, 181, 0.1);
  --text-shadow-color: rgba(0, 173, 181, 0.2);
  --disabled-color: #cccccc;
}

/* Allgemeine Stile */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

.App {
  font-family: var(--font-family);
  background-color: var(--pri-bg-color);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  color: var(--font-color);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  background-color: var(--pri-color);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
}

.header h1 {
  font-size: 2.5rem;
  color: var(--font-color);
  text-shadow: 2px 2px 4px var(--text-shadow-color);
}

.header-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.header-buttons button,
.header-buttons select,
button {
  width: 100%;
  background-color: var(--font-color);
  color: var(--pri-color);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.header-buttons button:hover,
.header-buttons select:hover,
button:hover {
  background-color: var(--hover-color);
  color: var(--font-color);
  transform: scale(1.01);
}

.header-buttons button:disabled,
.header-buttons select:disabled,
button:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
  transform: none;
}

/* Timer-Anzeige */
.timer {
  font-size: 5rem;
  font-weight: bold;
  color: var(--font-color);
  animation: pulse 2s infinite;
  text-shadow: 2px 2px 4px var(--text-shadow-color);
}

/* Phasen-Indikator */
.phase-indicator {
  font-size: 2rem;
  color: var(--pri-color);
  text-shadow: 1px 1px 2px var(--text-shadow-color);
}

/* Fortschrittsbalken */
.progress-bar {
  width: 100%;
  max-width: 900px;
  height: 1rem;
  background-color: var(--sec-bg-color);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.progress {
  height: 100%;
  background-color: var(--pri-color);
  transition: width 0.5s ease;
}

/* Benutzerdefinierte Timer-Einstellungen */
.custom-timer {
  padding: 0.5rem;
  border: 2px solid var(--pri-color);
  border-radius: 0.5rem;
  background-color: var(--pri-bg-color);
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
}

.custom-timer div {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-timer label {
  font-size: 1.2rem;
  color: var(--font-color);
}

.custom-timer input {
  padding: 0.5rem;
  border: 2px solid var(--pri-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 80px;
  text-align: center;
  background-color: var(--sec-bg-color);
  color: var(--font-color);
}

/* Abgeschlossene Phasen */
.completed-phases {
  width: 100%;
  max-width: 900px;
  border: 2px solid var(--pri-color);
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: var(--pri-bg-color);
  box-shadow: 0 4px 6px var(--shadow-color);
}

.completed-phases h3 {
  font-size: 1.5rem;
  color: var(--font-color);
  position: sticky;
  top: 0;
  background-color: inherit;
  z-index: 1;
}

.completed-phases-list {
  max-height: 150px; /* Passen Sie die Höhe nach Bedarf an */
  overflow-y: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none; /* Firefox */
}

.completed-phases-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari und Opera */
}

.completed-phases-list ul {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.completed-phases-list li {
  font-size: 1.2rem;
  color: var(--font-color-highlight);
}

.total-time h3 {
  font-size: 1.5rem;
  color: var(--font-color);
}

.total-time p {
  font-size: 1.2rem;
  color: var(--font-color-highlight);
}

/* Gesamtzeit-Anzeige */
.total-time {
  width: 100%;
  max-width: 900px;
  border: 2px solid var(--pri-color);
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: var(--pri-bg-color);
  box-shadow: 0 4px 6px var(--shadow-color);
}

/* Buttons */
.buttons {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.buttons button {
  flex: 1;
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

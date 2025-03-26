import { useState, useEffect, useRef } from "react";

const App = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [method, setMethod] = useState("pomodoro");
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [customCycles, setCustomCycles] = useState(4);
  const [currentMode, setCurrentMode] = useState("Arbeit");
  const [theme, setTheme] = useState("dark"); // Dark/Light-Modus

  const alarmSound = useRef(new Audio("/sounds/timer-alarm.wav"));
  const startTimeRef = useRef(null);

  const methods = {
    pomodoro: { work: 25, break: 5, cycles: 4 },
    longWork: { work: 50, break: 10, cycles: 4 },
    shortWork: { work: 15, break: 3, cycles: 4 },
    custom: { work: customWorkTime, break: customBreakTime, cycles: customCycles },
  };

  // Dark/Light-Modus umschalten
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Setze das Theme beim Laden der Komponente
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Aktualisiere die Felder, wenn eine Methode ausgewählt wird
  useEffect(() => {
    if (method !== "custom") {
      setCustomWorkTime(methods[method].work);
      setCustomBreakTime(methods[method].break);
      setCustomCycles(methods[method].cycles);
    }
  }, [method]);

  const startTimer = () => {
    setIsRunning(true);
    startTimeRef.current = performance.now();
    setTimeLeft(methods[method].work * 60);
    setCurrentMode("Arbeit");
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setCyclesCompleted(0);
    setTotalWorkTime(0);
    setTotalBreakTime(0);
    setCurrentMode("Arbeit");
  };

  const switchMethod = (newMethod) => {
    setMethod(newMethod);
    resetTimer();
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const elapsed = Math.floor((performance.now() - startTimeRef.current) / 1000);
        const remaining = (currentMode === "Arbeit" ? methods[method].work : methods[method].break) * 60 - elapsed;
        setTimeLeft(remaining > 0 ? remaining : 0);

        if (remaining <= 0) {
          clearInterval(interval);
          alarmSound.current.play();
          if (currentMode === "Arbeit") {
            setTotalWorkTime((prev) => prev + methods[method].work * 60);
            setCurrentMode("Pause");
            startTimeRef.current = performance.now();
            setTimeLeft(methods[method].break * 60);
          } else {
            setTotalBreakTime((prev) => prev + methods[method].break * 60);
            setCyclesCompleted((prev) => prev + 1);
            if (cyclesCompleted < methods[method].cycles - 1) {
              setCurrentMode("Arbeit");
              startTimeRef.current = performance.now();
              setTimeLeft(methods[method].work * 60);
            } else {
              setIsRunning(false);
            }
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, cyclesCompleted, method, currentMode]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Berechne den Fortschritt für die Progress-Bar
  const progress = () => {
    const totalTime = currentMode === "Arbeit" ? methods[method].work * 60 : methods[method].break * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Pomodoro Timer</h1>
        <div className="header-buttons">
          <button onClick={toggleTheme}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
      <div className="custom-timer">
        <h3>Timer-Einstellungen</h3>
        <div>
          <label>Methode:</label>
          <select value={method} onChange={(e) => switchMethod(e.target.value)}>
            <option value="pomodoro">Klassisch</option>
            <option value="longWork">Lange Phasen</option>
            <option value="shortWork">Kurze Phasen</option>
            <option value="custom">Benutzerdefiniert</option>
          </select>
        </div>
        <div>
          <label>Arbeitszeit (Minuten):</label>
          <input
            type="number"
            value={customWorkTime}
            onChange={(e) => {
              setCustomWorkTime(parseInt(e.target.value));
              setMethod("custom");
            }}
          />
        </div>
        <div>
          <label>Pausenzeit (Minuten):</label>
          <input
            type="number"
            value={customBreakTime}
            onChange={(e) => {
              setCustomBreakTime(parseInt(e.target.value));
              setMethod("custom");
            }}
          />
        </div>
        <div>
          <label>Zyklen:</label>
          <input
            type="number"
            value={customCycles}
            onChange={(e) => {
              setCustomCycles(parseInt(e.target.value));
              setMethod("custom");
            }}
          />
        </div>
        <div className="controls">
        <button onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button onClick={stopTimer} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      </div>
      
      <div className="timer-display">
        <h2 className="timer">{formatTime(timeLeft)}</h2>
        <p className="phase-indicator">{currentMode}</p>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress()}%` }}></div>
      </div>
      
      <div className="stats">
        <p>Abgeschlossene Zyklen: {cyclesCompleted}/{methods[method].cycles}</p>
        <p>Gesamte Arbeitszeit: {formatTime(totalWorkTime)}</p>
        <p>Gesamte Pausenzeit: {formatTime(totalBreakTime)}</p>
      </div>
    </div>
  );
};

export default App;
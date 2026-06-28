// ============================================================
// App.jsx — Full Habit Tracker & Streak Dashboard
// Single JSX file: all components, pages, routing logic
// ============================================================
// NOTE: In a real Vite/CRA project, import React from 'react'
// and import { BrowserRouter, Routes, Route, ... } from 'react-router-dom'
// and import './styles.css'
// and import * as utils from './utils.js'
// ============================================================
/*cd D:\Projects\HabitTracker
npx vite
http://localhost:5173 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  loadHabits, saveHabits, addHabit, deleteHabit, updateHabit,
  loadCheckins, toggleCheckin, isCheckedToday,
  calcCurrentStreak, calcLongestStreak,
  getTotalCheckins, getCompletionRate, getOverallCompletionRate,
  getBestHabit, getHeatmapData, calcMomentum,
  loadFreezeToken, useFreezeToken,
  CATEGORIES, FREQUENCIES, CATEGORY_COLORS,
  todayStr, daysAgo,
} from "./utils.js";

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "My Habits" },
    { to: "/insights", label: "Insights" },
    { to: "/about", label: "About" },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-icon">⚡</span>
        Habit<span>Flow</span>
      </Link>

      {/* Desktop links */}
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Hamburger */}
      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile menu */}
      <ul className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage() {
  const [totalCheckins, setTotalCheckins] = useState(getTotalCheckins());
  const [completionRate, setCompletionRate] = useState(getOverallCompletionRate());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setTotalCheckins(getTotalCheckins());
    setCompletionRate(getOverallCompletionRate());
    const habits = loadHabits();
    const checkins = loadCheckins();
    const allDates = Object.values(checkins).flat();
    setStreak(calcCurrentStreak(allDates));
  }, []);

  return (
    <div className="page-wrap">
      <section className="hero">
        {/* Left column */}
        <div className="hero-left">
          <div className="hero-badge">✦ Streak Dashboard</div>

          <h1>
            Build habits that{" "}
            <span className="highlight">actually stick</span>
          </h1>

          <p className="hero-sub">
            Track daily habits, visualize consistency, and grow your streaks —
            all stored locally in your browser. No sign-up. No noise.
          </p>

          {/* Stats */}
          <div className="hero-stats-row">
            <div className="stat-pill">
              <span className="label">Current Streak</span>
              <span className="value">{streak}🔥</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="label">Completion</span>
              <span className="value">{completionRate}%</span>
            </div>
          </div>

          {/* Live global stat */}
          <div className="live-count">
            <div className="pulse-dot" />
            <span>
              <span className="count-num" key={totalCheckins}>
                {totalCheckins}
              </span>{" "}
              total check-ins logged across all habits
            </span>
          </div>

          <Link to="/dashboard" className="btn-primary">
            Begin Tracking →
          </Link>
        </div>

        {/* Right column — SVG illustration */}
        <div className="hero-right">
          <div className="hero-svg-wrap">
            <HeroIllustration />
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circles */}
      <circle cx="210" cy="190" r="155" stroke="#6c63ff" strokeOpacity="0.08" strokeWidth="1" className="ring" />
      <circle cx="210" cy="190" r="130" stroke="#6c63ff" strokeOpacity="0.12" strokeWidth="1" />
      <circle cx="210" cy="190" r="105" stroke="#6c63ff" strokeOpacity="0.18" strokeWidth="1" />

      {/* Main circle bg */}
      <circle cx="210" cy="190" r="85" fill="#1a1d27" stroke="#2e3248" strokeWidth="1.5" />

      {/* Ring progress */}
      <circle
        cx="210" cy="190" r="75"
        stroke="#2e3248" strokeWidth="10" fill="none"
      />
      <circle
        cx="210" cy="190" r="75"
        stroke="url(#grad1)" strokeWidth="10" fill="none"
        strokeDasharray="471"
        strokeDashoffset="118"
        strokeLinecap="round"
        transform="rotate(-90 210 190)"
        style={{ animation: "none" }}
      />

      {/* Center text */}
      <text x="210" y="182" textAnchor="middle" fill="#e8eaf6" fontSize="28" fontWeight="800" fontFamily="system-ui">75%</text>
      <text x="210" y="202" textAnchor="middle" fill="#8b90b0" fontSize="10" fontFamily="system-ui" textTransform="uppercase" letterSpacing="2">Done today</text>

      {/* Habit cards floating */}
      <g transform="translate(14, 50)">
        <rect width="110" height="44" rx="10" fill="#1a1d27" stroke="#2e3248" />
        <rect x="0" y="0" width="4" height="44" rx="2" fill="#22c55e" />
        <text x="14" y="18" fill="#e8eaf6" fontSize="9" fontWeight="700" fontFamily="system-ui">🏃 Morning Run</text>
        <text x="14" y="32" fill="#8b90b0" fontSize="8" fontFamily="system-ui">🔥 12 day streak</text>
        <rect x="80" y="14" width="20" height="16" rx="4" fill="#22c55e" opacity="0.2" />
        <text x="90" y="25" textAnchor="middle" fill="#22c55e" fontSize="10">✓</text>
      </g>

      <g transform="translate(296, 60)">
        <rect width="110" height="44" rx="10" fill="#1a1d27" stroke="#2e3248" />
        <rect x="0" y="0" width="4" height="44" rx="2" fill="#6c63ff" />
        <text x="14" y="18" fill="#e8eaf6" fontSize="9" fontWeight="700" fontFamily="system-ui">📚 Read 30min</text>
        <text x="14" y="32" fill="#8b90b0" fontSize="8" fontFamily="system-ui">🔥 5 day streak</text>
      </g>

      <g transform="translate(296, 270)">
        <rect width="110" height="44" rx="10" fill="#1a1d27" stroke="#2e3248" />
        <rect x="0" y="0" width="4" height="44" rx="2" fill="#06b6d4" />
        <text x="14" y="18" fill="#e8eaf6" fontSize="9" fontWeight="700" fontFamily="system-ui">🧘 Meditate</text>
        <text x="14" y="32" fill="#8b90b0" fontSize="8" fontFamily="system-ui">🔥 21 day streak</text>
        <rect x="80" y="14" width="20" height="16" rx="4" fill="#06b6d4" opacity="0.2" />
        <text x="90" y="25" textAnchor="middle" fill="#06b6d4" fontSize="10">✓</text>
      </g>

      {/* Mini heatmap bottom */}
      <g transform="translate(130, 300)">
        {Array.from({ length: 21 }, (_, i) => (
          <rect
            key={i}
            x={i * 12} y={0}
            width="10" height="10" rx="2"
            fill={i % 3 === 0 ? "#6c63ff" : i % 5 === 0 ? "#2e3248" : "#3d4267"}
            opacity={0.3 + (i / 21) * 0.7}
          />
        ))}
      </g>

      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#00d4aa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============================================================
// DAILY DASHBOARD
// ============================================================
function DailyDashboard() {
  const [habits, setHabits] = useState([]);
  const [checkins, setCheckins] = useState({});
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [pomodoroHabit, setPomodoroHabit] = useState(null);
  const navigate = useNavigate();

  const refresh = useCallback(() => {
    setHabits(loadHabits());
    setCheckins(loadCheckins());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const todayHabits = habits.filter((h) => {
    if (h.frequency === "Daily") return true;
    if (h.frequency === "Weekly") {
      const today = new Date().getDay();
      return today === 1; // Monday for weekly
    }
    return true;
  });

  const checkedCount = todayHabits.filter((h) =>
    (checkins[h.id] || []).includes(todayStr())
  ).length;

  const progress = todayHabits.length
    ? Math.round((checkedCount / todayHabits.length) * 100)
    : 0;

  const handleToggle = (habitId) => {
    const updated = toggleCheckin(habitId);
    setCheckins({ ...updated });
  };

  const handlePomodoro = (habit) => {
    setPomodoroHabit(habit);
    setPomodoroOpen(true);
  };

  // Freeze token state
  const [freezeToken, setFreezeToken] = useState(loadFreezeToken());

  const handleFreeze = () => {
    if (useFreezeToken()) {
      setFreezeToken(loadFreezeToken());
    }
  };

  return (
    <div className="page-wrap">
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Today's Habits</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => navigate("/habits/new")}
          >
            + Add Habit
          </button>
        </div>

        {/* Freeze token banner */}
        {freezeToken.available && (
          <div className="freeze-banner">
            <div className="freeze-info">
              ❄️ You have a <span>Streak Freeze Token</span> available this week.
              Use it to protect a streak if you miss a day.
            </div>
            <button className="btn-secondary" onClick={handleFreeze}>
              Use Freeze
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Daily Progress</span>
            <strong>{checkedCount} / {todayHabits.length} habits</strong>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Habit cards */}
        {todayHabits.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🌱</div>
            <h3>No habits yet</h3>
            <p>Start by adding your first habit!</p>
            <button
              className="btn-primary"
              style={{ margin: "1rem auto 0" }}
              onClick={() => navigate("/habits/new")}
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="habits-grid">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkins={checkins}
                onToggle={handleToggle}
                onPomodoro={handlePomodoro}
              />
            ))}
          </div>
        )}

        {/* Pomodoro Timer */}
        {pomodoroOpen && (
          <PomodoroTimer
            habit={pomodoroHabit}
            onClose={() => setPomodoroOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function HabitCard({ habit, checkins, onToggle, onPomodoro }) {
  const dates = checkins[habit.id] || [];
  const isChecked = dates.includes(todayStr());
  const currentStreak = calcCurrentStreak(dates);
  const longestStreak = calcLongestStreak(dates);
  const catColor = CATEGORY_COLORS[habit.category] || "#6c63ff";

  return (
    <div
      className={`habit-card ${isChecked ? "checked" : ""}`}
      style={{ "--cat-color": catColor }}
    >
      <div className="card-top">
        <span className="habit-name">{habit.name}</span>
        <span className="cat-badge">{habit.category}</span>
      </div>

      <div className="streak-row">
        <div className="streak-item">
          <span className="s-label">Current</span>
          <span className="s-val">{currentStreak}<span className="fire">🔥</span></span>
        </div>
        <div className="streak-item">
          <span className="s-label">Longest</span>
          <span className="s-val">{longestStreak}⭐</span>
        </div>
        <div className="streak-item">
          <span className="s-label">Freq</span>
          <span className="s-val" style={{ fontSize: "0.9rem", paddingTop: "4px" }}>{habit.frequency}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          className={`toggle-btn ${isChecked ? "done" : ""}`}
          onClick={() => onToggle(habit.id)}
        >
          {isChecked ? "✓ Done!" : "Mark Done"}
        </button>
        <button
          className="btn-secondary"
          style={{ padding: "0.5rem 0.6rem", fontSize: "1rem" }}
          onClick={() => onPomodoro(habit)}
          title="Start Pomodoro"
        >
          🍅
        </button>
      </div>
    </div>
  );
}

// ============================================================
// POMODORO TIMER (Bonus)
// ============================================================
function PomodoroTimer({ habit, onClose }) {
  const WORK = 25 * 60;
  const BREAK = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("work");
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const start = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          const next = mode === "work" ? "break" : "work";
          setMode(next);
          return next === "work" ? WORK : BREAK;
        }
        return t - 1;
      });
    }, 1000);
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(mode === "work" ? WORK : BREAK);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="pomodoro-float">
      <div className="pomo-title">🍅 Pomodoro</div>
      {habit && (
        <div className="pomo-linked">Linked: {habit.name}</div>
      )}
      <div className="pomo-display">{mm}:{ss}</div>
      <div className="pomo-mode">{mode === "work" ? "Focus Time" : "Break Time"}</div>
      <div className="pomo-controls">
        {!running ? (
          <button className="pomo-btn start" onClick={start}>▶ Start</button>
        ) : (
          <button className="pomo-btn" onClick={pause}>⏸ Pause</button>
        )}
        <button className="pomo-btn" onClick={reset}>↺</button>
        <button className="pomo-btn" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

// ============================================================
// ADD HABIT FORM
// ============================================================
function AddHabitForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", category: "", frequency: "" });
  const [touched, setTouched] = useState({});
  const [success, setSuccess] = useState(false);
  const [editId, setEditId] = useState(null);

  const errors = {
    name: !form.name.trim() ? "Habit name is required" : "",
    category: !form.category ? "Please select a category" : "",
    frequency: !form.frequency ? "Please select a frequency" : "",
  };

  const isValid = !errors.name && !errors.category && !errors.frequency;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const handleSubmit = () => {
    if (!isValid) return;
    if (editId) {
      updateHabit(editId, form);
    } else {
      addHabit(form);
    }
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const habits = loadHabits();

  const startEdit = (habit) => {
    setEditId(habit.id);
    setForm({ name: habit.name, category: habit.category, frequency: habit.frequency });
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this habit? This cannot be undone.")) {
      deleteHabit(id);
      navigate(0); // reload
    }
  };

  return (
    <div className="page-wrap">
      <div className="form-page">
        <div className="page-header">
          <h1 className="page-title">My Habits</h1>
        </div>

        {/* Form */}
        <div className="form-card">
          <h2 className="form-title">{editId ? "✏️ Edit Habit" : "➕ New Habit"}</h2>

          {success && (
            <div className="success-toast">
              ✅ Habit {editId ? "updated" : "added"} successfully! Redirecting...
            </div>
          )}

          <div className="field-group">
            <label>Habit Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Morning run, Read 30 min..."
            />
            {touched.name && errors.name && (
              <span className="field-error">{errors.name}</span>
            )}
          </div>

          <div className="field-group">
            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {touched.category && errors.category && (
              <span className="field-error">{errors.category}</span>
            )}
          </div>

          <div className="field-group">
            <label>Frequency</label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select frequency...</option>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {touched.frequency && errors.frequency && (
              <span className="field-error">{errors.frequency}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              className="btn-submit"
              disabled={!isValid}
              onClick={handleSubmit}
            >
              {editId ? "Save Changes" : "Add Habit"}
            </button>
            {editId && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", category: "", frequency: "" });
                  setTouched({});
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing habits list */}
        {habits.length > 0 && (
          <>
            <h2 style={{ marginTop: "2rem", marginBottom: "0.5rem", fontSize: "1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Existing Habits
            </h2>
            <div className="habits-list">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="list-item"
                  style={{ "--cat-color": CATEGORY_COLORS[h.category] || "#6c63ff" }}
                >
                  <div className="list-item-info">
                    <div className="list-item-name">{h.name}</div>
                    <div className="list-item-meta">{h.category} · {h.frequency}</div>
                  </div>
                  <div className="list-item-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => startEdit(h)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-secondary btn-danger"
                      onClick={() => handleDelete(h.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CONSISTENCY GRID (heatmap)
// ============================================================
function ConsistencyGrid() {
  const [category, setCategory] = useState("all");
  const [days] = useState(30);
  const habits = loadHabits();
  const checkins = loadCheckins();
  const data = getHeatmapData(days, category);

  const allStreak = calcCurrentStreak(
    Object.values(checkins).flat()
  );

  const motivationMsg = (streak) => {
    if (streak === 0) return "Every journey starts with a single step. Check in today!";
    if (streak < 3) return `${streak} days in! The habit is just warming up. 💪`;
    if (streak < 7) return `${streak} days strong! You're building real momentum. 🔥`;
    if (streak < 14) return `${streak} days! You're past the hardest part. Keep going! 🚀`;
    if (streak < 30) return `${streak} days — you're in the zone. This is who you are now. ⭐`;
    return `${streak} days!!! You're absolutely unstoppable. 👑`;
  };

  const categories = ["all", ...CATEGORIES];

  const getLevel = (count, total) => {
    if (!total || count === 0) return 0;
    const ratio = count / total;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  return (
    <div className="page-wrap">
      <div className="grid-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Consistency Grid</h1>
            <p className="page-subtitle">Your last {days} days at a glance</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="filter-row">
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-btn ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>

        {/* Heatmap */}
        <div className="heatmap-grid">
          {data.map((cell) => (
            <div
              key={cell.date}
              className="heat-cell"
              data-level={getLevel(cell.count, cell.total)}
              style={{
                background: category !== "all" && cell.count > 0
                  ? `${CATEGORY_COLORS[category] || "#6c63ff"}${Math.round(getLevel(cell.count, cell.total) * 60).toString(16).padStart(2, "0")}`
                  : undefined,
              }}
            >
              <div className="heat-tooltip">
                {cell.date}: {cell.count} / {cell.total} habits
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span>Less</span>
          {[0,1,2,3,4].map((l) => (
            <div key={l} className="heat-cell" data-level={l}
              style={{ width: 16, height: 16, display: "inline-block", flexShrink: 0 }} />
          ))}
          <span>More</span>
        </div>

        {/* Motivation */}
        <div className="motivation-msg">
          <strong>Day {allStreak} streak:</strong> {motivationMsg(allStreak)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INSIGHTS
// ============================================================
function Insights() {
  const habits = loadHabits();
  const checkins = loadCheckins();

  const allDates = Object.values(checkins).flat();
  const totalCheckins = getTotalCheckins();
  const overallRate = getOverallCompletionRate();
  const currentStreak = calcCurrentStreak(allDates);
  const longestStreak = calcLongestStreak(allDates);
  const bestHabit = getBestHabit();

  // Momentum score gradient
  const momentumColor = (score) => {
    if (score >= 75) return "#00d4aa";
    if (score >= 50) return "#6c63ff";
    if (score >= 25) return "#f97316";
    return "#ff6b6b";
  };

  return (
    <div className="page-wrap">
      <div className="insights-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Insights</h1>
            <p className="page-subtitle">Deep dive into your habit data</p>
          </div>
        </div>

        {/* Global stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="sc-label">Total Habits</span>
            <span className="sc-val">{habits.length}</span>
          </div>
          <div className="stat-card">
            <span className="sc-label">Completion Rate</span>
            <span className="sc-val">{overallRate}%</span>
            <span className="sc-sub">Last 7 days average</span>
          </div>
          <div className="stat-card">
            <span className="sc-label">Current Streak</span>
            <span className="sc-val">{currentStreak}🔥</span>
          </div>
          <div className="stat-card">
            <span className="sc-label">Longest Streak</span>
            <span className="sc-val">{longestStreak}⭐</span>
          </div>
          <div className="stat-card">
            <span className="sc-label">Total Check-ins</span>
            <span className="sc-val">{totalCheckins}</span>
          </div>
        </div>

        {/* Best habit */}
        {bestHabit && (
          <div className="best-habit-card">
            <div className="trophy-icon">🏆</div>
            <div>
              <div className="best-label">Best Habit (Last 30 Days)</div>
              <div className="best-name">{bestHabit.name}</div>
              <div className="best-rate">
                {getCompletionRate(bestHabit.id, 30)}% completion rate
              </div>
            </div>
          </div>
        )}

        {/* Per habit cards */}
        {habits.length > 0 && (
          <>
            <h2 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
              Per Habit Breakdown
            </h2>
            <div className="per-habit-grid">
              {habits.map((h) => {
                const hDates = checkins[h.id] || [];
                return (
                  <div
                    key={h.id}
                    className="per-habit-card"
                    style={{ "--cat-color": CATEGORY_COLORS[h.category] || "#6c63ff" }}
                  >
                    <div className="ph-name">{h.name}</div>
                    <div className="ph-row">
                      <span>Current streak</span>
                      <span className="ph-val">{calcCurrentStreak(hDates)}🔥</span>
                    </div>
                    <div className="ph-row">
                      <span>7-day rate</span>
                      <span className="ph-val">{getCompletionRate(h.id, 7)}%</span>
                    </div>
                    <div className="ph-row">
                      <span>Category</span>
                      <span className="ph-val" style={{ color: CATEGORY_COLORS[h.category] }}>{h.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Habit Momentum (Bonus) */}
        {habits.length > 0 && (
          <div className="momentum-wrap">
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              ⚡ Habit Momentum
            </h2>
            <p className="momentum-label">
              A recency-weighted score (0–100) — recent days count more.
            </p>
            {habits.map((h) => {
              const score = calcMomentum(h.id);
              return (
                <div key={h.id} className="momentum-item">
                  <span className="momentum-name" title={h.name}>{h.name}</span>
                  <div className="momentum-bar-bg">
                    <div
                      className="momentum-bar-fill"
                      style={{
                        width: `${score}%`,
                        background: `linear-gradient(90deg, ${momentumColor(score)}, ${momentumColor(score)}aa)`,
                      }}
                    />
                  </div>
                  <span className="momentum-score" style={{ color: momentumColor(score) }}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ABOUT PAGE
// ============================================================
function AboutPage() {
  return (
    <div className="page-wrap">
      <div className="about-page">
        <div className="page-header">
          <h1 className="page-title">About HabitFlow</h1>
        </div>

        <div className="about-section">
          <h2>🌊 What is HabitFlow?</h2>
          <p>
            HabitFlow is a zero-backend, privacy-first habit tracking app built
            entirely in the browser. Everything lives in your localStorage —
            no accounts, no servers, no tracking. Just you and your habits.
          </p>
          <p>
            Track daily rituals, visualize consistency with a heat map,
            grow your streaks, and understand your patterns through real insights.
          </p>
        </div>

        <div className="about-section">
          <h2>🛠 Tech Stack</h2>
          <p>Built with modern web technologies as part of the Kshitij Web Dev Workshop 2026.</p>
          <div className="tech-chips">
            {["React 18", "React Router v6", "Vite", "CSS Variables", "localStorage API", "CSS Animations", "SVG", "Functional Components", "Hooks"].map((t) => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h2>📖 What I Learned</h2>
          <p>
            Building HabitFlow taught me that state management doesn't require
            a library — thoughtful use of React hooks and localStorage is enough
            for a feature-rich app.
          </p>
          <p>
            CSS-only animations are more powerful than they look: the progress
            bar shimmer, card check animation, and pulse dot all use zero JavaScript.
          </p>
          <p>
            Streak calculation is trickier than it sounds. Off-by-one date errors
            will haunt you at 2am. Always use ISO date strings and compare carefully.
          </p>
        </div>

        <div className="about-section">
          <h2>😄 Memes & Vibes</h2>
          <div className="meme-box">
            <div>Me on Day 1 of a new habit: 💪</div>
            <div>Me on Day 2: 💪</div>
            <div>Me on Day 3: 💪</div>
            <div>Me forgetting to check in on Day 4 at 11:59 PM: 😱</div>
            <div>Me using the Freeze Token: 😌❄️</div>
          </div>
          <p style={{ marginTop: "1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            "A habit is just a decision you made once and never had to make again." <br />
            <em>— Someone on the internet, probably</em>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 404 PAGE
// ============================================================
function NotFound() {
  return (
    <div className="page-wrap">
      <div className="not-found">
        <div className="code">404</div>
        <h2>Habit Not Found</h2>
        <p>This page took a day off and broke its streak. 😅</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DailyDashboard />} />
        <Route path="/habits/new" element={<AddHabitForm />} />
        <Route path="/consistency" element={<ConsistencyGrid />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
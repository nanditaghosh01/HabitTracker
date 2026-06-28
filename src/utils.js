// ============================================================
// utils.js — All data logic, localStorage, streak calculation
// ============================================================

export const STORAGE_KEYS = {
  HABITS: "ht_habits",
  CHECKINS: "ht_checkins",
  FREEZE: "ht_freeze_token",
};

// ---------- localStorage helpers ----------
export function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Date helpers ----------
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function dateStr(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

// ---------- Habit CRUD ----------
export function loadHabits() {
  return loadData(STORAGE_KEYS.HABITS) || [];
}

export function saveHabits(habits) {
  saveData(STORAGE_KEYS.HABITS, habits);
}

export function addHabit(habit) {
  const habits = loadHabits();
  const newHabit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: todayStr(),
  };
  habits.push(newHabit);
  saveHabits(habits);
  return newHabit;
}

export function deleteHabit(id) {
  const habits = loadHabits().filter((h) => h.id !== id);
  saveHabits(habits);
  const checkins = loadCheckins();
  delete checkins[id];
  saveData(STORAGE_KEYS.CHECKINS, checkins);
}

export function updateHabit(id, updates) {
  const habits = loadHabits().map((h) => (h.id === id ? { ...h, ...updates } : h));
  saveHabits(habits);
}

// ---------- Check-in CRUD ----------
export function loadCheckins() {
  return loadData(STORAGE_KEYS.CHECKINS) || {};
}

export function toggleCheckin(habitId) {
  const checkins = loadCheckins();
  const today = todayStr();
  if (!checkins[habitId]) checkins[habitId] = [];
  const idx = checkins[habitId].indexOf(today);
  if (idx > -1) {
    checkins[habitId].splice(idx, 1);
  } else {
    checkins[habitId].push(today);
  }
  saveData(STORAGE_KEYS.CHECKINS, checkins);
  return checkins;
}

export function isCheckedToday(habitId) {
  const checkins = loadCheckins();
  return (checkins[habitId] || []).includes(todayStr());
}

// ---------- Streak calculation ----------
export function calcCurrentStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 0;
  let cursor = new Date(todayStr());
  for (const d of sorted) {
    const dDate = new Date(d);
    const diff = Math.round((cursor - dDate) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = dDate;
    } else {
      break;
    }
  }
  return streak;
}

export function calcLongestStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

// ---------- Stats ----------
export function getTotalCheckins() {
  const checkins = loadCheckins();
  return Object.values(checkins).reduce((sum, arr) => sum + arr.length, 0);
}

export function getCompletionRate(habitId, days = 7) {
  const checkins = loadCheckins();
  const dates = checkins[habitId] || [];
  const period = Array.from({ length: days }, (_, i) => daysAgo(i));
  const done = period.filter((d) => dates.includes(d)).length;
  return Math.round((done / days) * 100);
}

export function getOverallCompletionRate() {
  const habits = loadHabits();
  if (!habits.length) return 0;
  const rates = habits.map((h) => getCompletionRate(h.id, 7));
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
}

export function getBestHabit() {
  const habits = loadHabits();
  if (!habits.length) return null;
  return habits.reduce((best, h) => {
    const rate = getCompletionRate(h.id, 30);
    return !best || rate > getCompletionRate(best.id, 30) ? h : best;
  }, null);
}

export function getHeatmapData(days = 30, category = "all") {
  const habits = loadHabits().filter(
    (h) => category === "all" || h.category === category
  );
  const checkins = loadCheckins();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const count = habits.filter((h) =>
      (checkins[h.id] || []).includes(d)
    ).length;
    result.push({ date: d, count, total: habits.length });
  }
  return result;
}

// ---------- Habit Momentum (bonus) ----------
export function calcMomentum(habitId) {
  const checkins = loadCheckins();
  const dates = checkins[habitId] || [];
  let score = 0;
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.5, 0.5, 0.5, 0.3, 0.3];
  for (let i = 0; i < 15; i++) {
    const d = daysAgo(i);
    if (dates.includes(d)) score += weights[i] || 0.2;
  }
  return Math.min(100, Math.round((score / 53) * 100));
}

// ---------- Freeze Token ----------
export function loadFreezeToken() {
  const data = loadData(STORAGE_KEYS.FREEZE);
  if (!data) return { available: true, usedAt: null, expiresAt: null };
  const now = new Date();
  const expires = data.expiresAt ? new Date(data.expiresAt) : null;
  if (expires && now > expires) {
    return { available: true, usedAt: null, expiresAt: null };
  }
  return data;
}

export function useFreezeToken() {
  const token = loadFreezeToken();
  if (!token.available) return false;
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  saveData(STORAGE_KEYS.FREEZE, {
    available: false,
    usedAt: now.toISOString(),
    expiresAt: nextMonday.toISOString(),
  });
  return true;
}

// ---------- Categories ----------
export const CATEGORIES = ["Health", "Productivity", "Learning", "Fitness", "Mindfulness", "Custom"];
export const FREQUENCIES = ["Daily", "Weekly", "Custom"];

export const CATEGORY_COLORS = {
  Health: "#22c55e",
  Productivity: "#3b82f6",
  Learning: "#a855f7",
  Fitness: "#f97316",
  Mindfulness: "#06b6d4",
  Custom: "#f59e0b",
};
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SportForm, { type SportSession } from "@/components/SportForm";
import WorkoutForm, { type WorkoutEntry } from "@/components/WorkoutForm";
import WorkoutList from "@/components/WorkoutList";
import SportList from "@/components/SportList";

type RestDay = {
  id: string;
  date: string;
  createdAt: string;
};

function toDateKeyUTC(date: Date) {
  return date.toISOString().slice(0, 10);
}

function calculateStreak(activeDates: Set<string>, restDates: Set<string>) {
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = toDateKeyUTC(cursor);
    if (restDates.has(key)) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    if (activeDates.has(key)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    break;
  }

  return streak;
}

type HeatmapDay = {
  key: string;
  minutes: number;
  workouts: string[];
  sports: string[];
  workoutMinutes: number;
  sportMinutes: number;
};

function getMinutesMap(workouts: WorkoutEntry[], sessions: SportSession[]) {
  const map = new Map<string, HeatmapDay>();

  workouts.forEach((workout) => {
    const minutes = workout.duration ?? 0;
    const key = toDateKeyUTC(new Date(workout.date));
    const entry = map.get(key) ?? {
      key,
      minutes: 0,
      workouts: [],
      sports: [],
      workoutMinutes: 0,
      sportMinutes: 0,
    };
    entry.minutes += minutes > 0 ? minutes : 0;
    entry.workoutMinutes += minutes > 0 ? minutes : 0;
    entry.workouts.push(workout.title);
    map.set(key, entry);
  });

  sessions.forEach((session) => {
    const minutes = session.duration ?? 0;
    if (minutes <= 0) return;
    const key = toDateKeyUTC(new Date(session.date));
    const entry = map.get(key) ?? {
      key,
      minutes: 0,
      workouts: [],
      sports: [],
      workoutMinutes: 0,
      sportMinutes: 0,
    };
    entry.minutes += minutes;
    entry.sportMinutes += minutes;
    entry.sports.push(session.title);
    map.set(key, entry);
  });

  return map;
}

function getMonthHeatmapDays(minutesMap: Map<string, HeatmapDay>, date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = lastDay.getUTCDate();
  const leadingBlanks = firstDay.getUTCDay();

  const days: (HeatmapDay | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= totalDays; day += 1) {
    const key = toDateKeyUTC(new Date(Date.UTC(year, month, day)));
    days.push(
      minutesMap.get(key) ?? {
        key,
        minutes: 0,
        workouts: [],
        sports: [],
        workoutMinutes: 0,
        sportMinutes: 0,
      }
    );
  }

  return days;
}

function workoutHeatLevel(minutes: number) {
  if (minutes >= 100) return "bg-emerald-500";
  if (minutes >= 50) return "bg-emerald-400";
  if (minutes >= 30) return "bg-emerald-300";
  if (minutes > 0) return "bg-emerald-200";
  return "bg-slate-200";
}

function sportHeatLevel(minutes: number) {
  if (minutes >= 100) return "bg-blue-500";
  if (minutes >= 50) return "bg-blue-400";
  if (minutes >= 30) return "bg-blue-300";
  if (minutes > 0) return "bg-blue-200";
  return "bg-slate-200";
}

function heatClass(day: HeatmapDay) {
  if (day.workoutMinutes > 0 && day.sportMinutes > 0) {
    return `${workoutHeatLevel(day.workoutMinutes + day.sportMinutes)} ring-2 ring-blue-400`;
  }
  if (day.workoutMinutes > 0) {
    return workoutHeatLevel(day.workoutMinutes);
  }
  if (day.sportMinutes > 0) {
    return sportHeatLevel(day.sportMinutes);
  }
  return "bg-slate-200";
}

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SportSession[]>([]);
  const [isSportsLoading, setIsSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const [restDays, setRestDays] = useState<RestDay[]>([]);
  const [isRestDayUpdating, setIsRestDayUpdating] = useState(false);
  const [restError, setRestError] = useState<string | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/workouts");
        if (!response.ok) {
          throw new Error("Failed to load workouts");
        }
        const data = (await response.json()) as WorkoutEntry[];
        if (isActive) {
          setWorkouts(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    async function loadSports() {
      setIsSportsLoading(true);
      setSportsError(null);

      try {
        const response = await fetch("/api/sports");
        if (!response.ok) {
          throw new Error("Failed to load sports sessions");
        }
        const data = (await response.json()) as SportSession[];
        if (isActive) {
          setSessions(data);
        }
      } catch (err) {
        if (isActive) {
          setSportsError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (isActive) {
          setIsSportsLoading(false);
        }
      }
    }

    async function loadRestDays() {
      setRestError(null);

      try {
        const response = await fetch("/api/rest-days");
        if (!response.ok) {
          throw new Error("Failed to load rest days");
        }
        const data = (await response.json()) as RestDay[];
        if (isActive) {
          setRestDays(data);
        }
      } catch (err) {
        if (isActive) {
          setRestError(err instanceof Error ? err.message : "Unexpected error");
        }
      }
    }

    loadWorkouts();
    loadSports();
    loadRestDays();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDark);
  };

  function handleCreated(newWorkout: WorkoutEntry) {
    setWorkouts((prev) => [newWorkout, ...prev]);
    setIsWorkoutModalOpen(false);
  }

  function handleUpdated(updatedWorkout: WorkoutEntry) {
    setWorkouts((prev) => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
    setEditingWorkout(null);
    setIsWorkoutModalOpen(false);
  }

  function handleEdit(workout: WorkoutEntry) {
    setEditingWorkout(workout);
    setIsWorkoutModalOpen(true);
  }

  function handleCancelEdit() {
    setEditingWorkout(null);
  }

  async function handleDelete(workout: WorkoutEntry) {
    if (!confirm(`Are you sure you want to delete "${workout.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workout");
      }

      setWorkouts((prev) => prev.filter(w => w.id !== workout.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete workout");
    }
  }

  function handleSportCreated(newSession: SportSession) {
    setSessions((prev) => [newSession, ...prev]);
    setIsSportModalOpen(false);
  }

  const workoutDates = new Set(workouts.map((workout) => toDateKeyUTC(new Date(workout.date))));
  const activityDates = new Set([
    ...workoutDates,
    ...sessions.map((session) => toDateKeyUTC(new Date(session.date))),
  ]);
  const restDateKeys = new Set(restDays.map((restDay) => toDateKeyUTC(new Date(restDay.date))));
  const workoutStreak = calculateStreak(workoutDates, restDateKeys);
  const activityStreak = calculateStreak(activityDates, restDateKeys);
  const todayKey = toDateKeyUTC(new Date());
  const isRestDayToday = restDateKeys.has(todayKey);
  const minutesMap = getMinutesMap(workouts, sessions);
  const heatmapDays = getMonthHeatmapDays(minutesMap);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());

  async function handleRestDayToggle() {
    setIsRestDayUpdating(true);
    setRestError(null);

    try {
      const response = await fetch("/api/rest-days", {
        method: isRestDayToday ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayKey }),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message?.error ?? "Failed to update rest day");
      }

      if (isRestDayToday) {
        setRestDays((prev) =>
          prev.filter((restDay) => toDateKeyUTC(new Date(restDay.date)) !== todayKey)
        );
      } else {
        const created = (await response.json()) as RestDay;
        setRestDays((prev) => [created, ...prev]);
      }
    } catch (err) {
      setRestError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsRestDayUpdating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Touching Grass
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Sai Kuchulakanti
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            <Link
              href="/history"
              className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
            >
              View activity history
            </Link>
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-gray-800/80 p-6 shadow-sm backdrop-blur md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Workout streak
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              {workoutStreak}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Consecutive workout days
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Activity streak
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              {activityStreak}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Workouts or sports sessions
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rest day
            </p>
            <button
              onClick={handleRestDayToggle}
              disabled={isRestDayUpdating}
              className="w-fit rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRestDayToday ? "Remove rest day" : "Mark today as rest day"}
            </button>
            {restError ? (
              <p className="text-sm text-rose-600 dark:text-rose-400">{restError}</p>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400"></p>
            )}
          </div>
        </section>

        <section className="w-1/2 mx-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-gray-800/80 p-4 shadow-sm backdrop-blur md:w-1/3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Activity heatmap
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {monthLabel}
              </p>
            </div>
          </div>
          <div className="mt-4 w-full max-w-md self-start">
            <div className="grid grid-cols-7 gap-1.5">
              {heatmapDays.map((day, index) =>
                day ? (
                  <div
                    key={day.key}
                    title={`${day.key}: ${day.minutes} min${
                      day.workouts.length ? `\nWorkouts: ${day.workouts.join(", ")}` : ""
                    }${day.sports.length ? `\nSports: ${day.sports.join(", ")}` : ""}`}
                    className={`h-3 w-3 rounded ${heatClass(day)}`}
                  />
                ) : (
                  <div key={`blank-${index}`} className="h-3 w-3 rounded bg-transparent" />
                )
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Workouts</h2>
              <button
                onClick={() => {
                  setEditingWorkout(null);
                  setIsWorkoutModalOpen(true);
                }}
                className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
              >
                Add workout
              </button>
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Most Recent Workout
            </p>
            <WorkoutList
              workouts={workouts.slice(0, 1)}
              isLoading={isLoading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sports</h2>
              <button
                onClick={() => setIsSportModalOpen(true)}
                className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
              >
                Add sports session
              </button>
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Most Recent Sports Session
            </p>
            <SportList sessions={sessions.slice(0, 1)} isLoading={isSportsLoading} error={sportsError} />
          </div>
        </div>
      </div>

      {isWorkoutModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingWorkout ? "Edit workout" : "Add workout"}
              </h2>
              <button
                onClick={() => {
                  setIsWorkoutModalOpen(false);
                  handleCancelEdit();
                }}
                className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <WorkoutForm
                onCreated={handleCreated}
                onUpdated={handleUpdated}
                editingWorkout={editingWorkout}
              />
            </div>
          </div>
        </div>
      ) : null}

      {isSportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add sports session
              </h2>
              <button
                onClick={() => setIsSportModalOpen(false)}
                className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <SportForm onCreated={handleSportCreated} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

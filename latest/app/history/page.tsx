"use client";

import { useEffect, useState } from "react";
import SportForm, { type SportSession } from "@/components/SportForm";
import SportList from "@/components/SportList";
import WorkoutForm, { type WorkoutEntry } from "@/components/WorkoutForm";
import WorkoutList from "@/components/WorkoutList";

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const [sessions, setSessions] = useState<SportSession[]>([]);
  const [isSportsLoading, setIsSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<SportSession | null>(null);
  const [filter, setFilter] = useState<"all" | "workouts" | "sports">("all");

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

    loadWorkouts();
    loadSports();

    return () => {
      isActive = false;
    };
  }, []);

  function handleUpdated(updatedWorkout: WorkoutEntry) {
    setWorkouts((prev) => prev.map((workout) => (workout.id === updatedWorkout.id ? updatedWorkout : workout)));
    setEditingWorkout(null);
  }

  function handleEdit(workout: WorkoutEntry) {
    setEditingWorkout(workout);
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

      setWorkouts((prev) => prev.filter((item) => item.id !== workout.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete workout");
    }
  }

  function handleSportUpdated(updatedSession: SportSession) {
    setSessions((prev) =>
      prev.map((session) => (session.id === updatedSession.id ? updatedSession : session))
    );
    setEditingSession(null);
  }

  function handleSportEdit(session: SportSession) {
    setEditingSession(session);
  }

  function handleSportCancelEdit() {
    setEditingSession(null);
  }

  async function handleSportDelete(session: SportSession) {
    if (!confirm(`Are you sure you want to delete "${session.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sports/${session.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sports session");
      }

      setSessions((prev) => prev.filter((item) => item.id !== session.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete sports session");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">Activity History</h1>
          <p className="mt-2 text-sm text-slate-600">Review and edit workouts and sports.</p>
        </header>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filter === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700 hover:border-slate-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("workouts")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filter === "workouts"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700 hover:border-slate-400"
            }`}
          >
            Workouts
          </button>
          <button
            onClick={() => setFilter("sports")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filter === "sports"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700 hover:border-slate-400"
            }`}
          >
            Sports
          </button>
        </div>

        {editingWorkout && filter !== "sports" ? (
          <div className="flex flex-col gap-4">
            <WorkoutForm
              onCreated={() => {}}
              onUpdated={handleUpdated}
              editingWorkout={editingWorkout}
            />
            <button
              onClick={handleCancelEdit}
              className="w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              Cancel edit
            </button>
          </div>
        ) : null}

        {editingSession && filter !== "workouts" ? (
          <div className="flex flex-col gap-4">
            <SportForm
              onCreated={() => {}}
              onUpdated={handleSportUpdated}
              editingSession={editingSession}
            />
            <button
              onClick={handleSportCancelEdit}
              className="w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              Cancel edit
            </button>
          </div>
        ) : null}

        {filter !== "sports" ? (
          <WorkoutList
            workouts={workouts}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : null}

        {filter !== "workouts" ? (
          <SportList
            sessions={sessions}
            isLoading={isSportsLoading}
            error={sportsError}
            onEdit={handleSportEdit}
            onDelete={handleSportDelete}
          />
        ) : null}
      </div>
    </main>
  );
}

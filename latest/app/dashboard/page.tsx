"use client";

import { useEffect, useState } from "react";
import SportForm, { type SportSession } from "@/components/SportForm";
import WorkoutForm, { type WorkoutEntry } from "@/components/WorkoutForm";
import WorkoutList from "@/components/WorkoutList";
import SportList from "@/components/SportList";

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SportSession[]>([]);
  const [isSportsLoading, setIsSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);

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

  function handleCreated(newWorkout: WorkoutEntry) {
    setWorkouts((prev) => [newWorkout, ...prev]);
  }

  function handleUpdated(updatedWorkout: WorkoutEntry) {
    setWorkouts((prev) => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
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

      setWorkouts((prev) => prev.filter(w => w.id !== workout.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete workout");
    }
  }

  function handleSportCreated(newSession: SportSession) {
    setSessions((prev) => [newSession, ...prev]);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <WorkoutForm onCreated={handleCreated} onUpdated={handleUpdated} editingWorkout={editingWorkout} />
      {editingWorkout && (
        <button onClick={handleCancelEdit}>Cancel Edit</button>
      )}
      <WorkoutList workouts={workouts} isLoading={isLoading} error={error} onEdit={handleEdit} onDelete={handleDelete} />
      <SportForm onCreated={handleSportCreated} />
      <SportList sessions={sessions} isLoading={isSportsLoading} error={sportsError} />
    </main>
  );
}

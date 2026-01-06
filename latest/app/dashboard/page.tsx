"use client";

import { useEffect, useState } from "react";
import WorkoutForm, { type WorkoutEntry } from "@/components/WorkoutForm";
import WorkoutList from "@/components/WorkoutList";

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    loadWorkouts();

    return () => {
      isActive = false;
    };
  }, []);

  function handleCreated(newWorkout: WorkoutEntry) {
    setWorkouts((prev) => [newWorkout, ...prev]);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <WorkoutForm onCreated={handleCreated} />
      <WorkoutList workouts={workouts} isLoading={isLoading} error={error} />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type WorkoutFormProps = {
  onCreated: (workout: WorkoutEntry) => void;
  onUpdated?: (workout: WorkoutEntry) => void;
  editingWorkout?: WorkoutEntry | null;
};

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  totalWeight: number | null;
};

export type TagEntry = {
  id: string;
  name: string;
};

export type WorkoutEntry = {
  id: string;
  date: string;
  title: string;
  category: string;
  duration: number | null;
  notes: string | null;
  createdAt: string;
  exercises: ExerciseEntry[];
  tags: TagEntry[];
};

type ExerciseFormState = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type FormState = {
  date: string;
  title: string;
  category: string;
  duration: string;
  notes: string;
  exercises: ExerciseFormState[];
  tagsInput: string;
};

const initialFormState: FormState = {
  date: "",
  title: "",
  category: "",
  duration: "",
  notes: "",
  exercises: [{ name: "", sets: "", reps: "", weight: "" }],
  tagsInput: "",
};

function toNumberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

const EXERCISE_TAGS: Record<string, string> = {
  "bench press": "chest",
  "incline press": "chest",
  "decline press": "chest",
  "chest press": "chest",
  "chest fly": "chest",
  "pec fly": "chest",
  "push up": "chest",
  "squat": "legs",
  "front squat": "legs",
  "back squat": "legs",
  "deadlift": "back",
  "romanian deadlift": "hamstrings",
  "stiff leg deadlift": "hamstrings",
  "pull up": "back",
  "chin up": "back",
  "lat pulldown": "back",
  "bent over row": "back",
  "seated row": "back",
  "bicep curl": "biceps",
  "hammer curl": "biceps",
  "tricep extension": "triceps",
  "skull crusher": "triceps",
  "overhead press": "shoulders",
  "shoulder press": "shoulders",
  "lateral raise": "shoulders",
  "front raise": "shoulders",
  "rear delt fly": "shoulders",
  "leg curl": "hamstrings",
  "hamstring curl": "hamstrings",
  "leg extension": "quads",
  "quad extension": "quads",
  "calf raise": "calves",
  "crunch": "abs",
  "plank": "core",
  "lunge": "legs",
  "step up": "legs",
  "burpee": "cardio",
  "mountain climber": "cardio",
};

const TAG_KEYWORDS: Record<string, string> = {
  // Body parts
  back: "back",
  biceps: "biceps",
  chest: "chest",
  triceps: "triceps",
  legs: "legs",
  leg: "legs",
  shoulders: "shoulders",
  shoulder: "shoulders",
  delts: "shoulders",
  core: "core",
  abs: "abs",
  glutes: "glutes",
  quads: "quads",
  hamstrings: "hamstrings",
  calves: "calves",
  cardio: "cardio",
  // Exercises
  bench: "chest",
  press: "chest",
  incline: "chest",
  decline: "chest",
  fly: "chest",
  push: "chest",
  dip: "triceps",
  squat: "legs",
  deadlift: "back",
  pull: "back",
  row: "back",
  curl: "biceps",
  extension: "triceps",
  overhead: "shoulders",
  lateral: "shoulders",
  front: "shoulders",
  raise: "shoulders",
  pullup: "back",
  chinup: "back",
  pulldown: "back",
  lower: "legs",
  hamstring: "hamstrings",
  quad: "quads",
  glute: "glutes",
  calf: "calves",
  ab: "abs",
  crunch: "abs",
  plank: "core",
  lunge: "legs",
  step: "legs",
  jump: "legs",
  run: "cardio",
  bike: "cardio",
  swim: "cardio",
  treadmill: "cardio",
  elliptical: "cardio",
};

function inferTagsFromExercises(exercises: ExerciseFormState[]) {
  const found = new Set<string>();
  exercises.forEach((exercise) => {
    const name = exercise.name.toLowerCase().trim();
    // Check for exact exercise matches first
    const exactTag = EXERCISE_TAGS[name];
    if (exactTag) {
      found.add(exactTag);
    } else {
      // Fallback to keyword matching
      const tokens = name
        .replace(/&/g, "and")
        .split(/[^a-z]+/)
        .filter(Boolean);
      tokens.forEach((token) => {
        const tag = TAG_KEYWORDS[token];
        if (tag) found.add(tag);
      });
    }
  });
  return Array.from(found);
}

function parseTagsInput(tagsInput: string) {
  return Array.from(
    new Set(
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
  );
}

export default function WorkoutForm({ onCreated, onUpdated, editingWorkout }: WorkoutFormProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEditedTags, setHasEditedTags] = useState(false);

  const exerciseTotals = useMemo(() => {
    return formState.exercises.map((exercise) => {
      const sets = toNumberOrNull(exercise.sets);
      const reps = toNumberOrNull(exercise.reps);
      const weight = toNumberOrNull(exercise.weight);
      if (sets == null || reps == null || weight == null) return null;
      return sets * reps * weight;
    });
  }, [formState.exercises]);

  const inferredTags = useMemo(() => inferTagsFromExercises(formState.exercises), [formState.exercises]);

  useEffect(() => {
    if (!hasEditedTags) {
      setFormState((prev) => ({
        ...prev,
        tagsInput: inferredTags.join(", "),
      }));
    }
  }, [inferredTags, hasEditedTags]);

  useEffect(() => {
    if (editingWorkout) {
      setFormState({
        date: editingWorkout.date.split('T')[0], // assuming date is ISO string
        title: editingWorkout.title,
        category: editingWorkout.category,
        duration: editingWorkout.duration?.toString() ?? "",
        notes: editingWorkout.notes ?? "",
        exercises: editingWorkout.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets?.toString() ?? "",
          reps: ex.reps?.toString() ?? "",
          weight: ex.weight?.toString() ?? "",
        })),
        tagsInput: editingWorkout.tags.map(tag => tag.name).join(", "),
      });
      setHasEditedTags(false);
    } else {
      setFormState(initialFormState);
      setHasEditedTags(false);
    }
  }, [editingWorkout]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const exercises = formState.exercises
        .filter((exercise) => exercise.name.trim())
        .map((exercise) => ({
          name: exercise.name.trim(),
          sets: toNumberOrNull(exercise.sets),
          reps: toNumberOrNull(exercise.reps),
          weight: toNumberOrNull(exercise.weight),
        }));

      if (exercises.length === 0) {
        throw new Error("Add at least one exercise.");
      }

      const payload = {
        date: formState.date,
        title: formState.title.trim(),
        category: formState.category.trim(),
        duration: toNumberOrNull(formState.duration),
        notes: formState.notes.trim() || null,
        exercises,
        tags: parseTagsInput(formState.tagsInput),
      };

      let response;
      if (editingWorkout) {
        response = await fetch(`/api/workouts/${editingWorkout.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message?.error ?? `Failed to ${editingWorkout ? 'update' : 'create'} workout`);
      }

      const result = (await response.json()) as WorkoutEntry;
      if (editingWorkout) {
        onUpdated?.(result);
      } else {
        onCreated(result);
      }
      setFormState(initialFormState);
      setHasEditedTags(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function handleExerciseChange(
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;
    setFormState((prev) => {
      const nextExercises = prev.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [name]: value } : exercise
      );
      return { ...prev, exercises: nextExercises };
    });
  }

  function addExercise() {
    setFormState((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: "", reps: "", weight: "" }],
    }));
  }

  function removeExercise(index: number) {
    setFormState((prev) => {
      if (prev.exercises.length === 1) return prev;
      const nextExercises = prev.exercises.filter((_, exerciseIndex) => exerciseIndex !== index);
      return { ...prev, exercises: nextExercises };
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-900">
        {editingWorkout ? "Edit Workout" : "Add Workout"}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Track lifts, attach tags, and keep notes in one place.
      </p>
      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Date
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Title
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={handleChange}
            placeholder="Push day"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Category
          <input
            type="text"
            name="category"
            value={formState.category}
            onChange={handleChange}
            placeholder="Strength"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Tags (comma-separated)
          <input
            type="text"
            name="tagsInput"
            value={formState.tagsInput}
            onChange={(event) => {
              setHasEditedTags(true);
              handleChange(event);
            }}
            placeholder="back, biceps"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        {inferredTags.length > 0 && hasEditedTags ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>Suggested from exercises: {inferredTags.join(", ")}</span>
            <button
              type="button"
              onClick={() => {
                setFormState((prev) => ({
                  ...prev,
                  tagsInput: inferredTags.join(", "),
                }));
                setHasEditedTags(false);
              }}
              className="ml-3 inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400"
            >
              Use suggested
            </button>
          </div>
        ) : null}
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <legend className="px-2 text-sm font-semibold text-slate-700">Exercises</legend>
          {formState.exercises.map((exercise, index) => (
            <div
              key={`exercise-${index}`}
              className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Exercise name
                <input
                  type="text"
                  name="name"
                  value={exercise.name}
                  onChange={(event) => handleExerciseChange(index, event)}
                  placeholder="Bench Press"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Sets
                <input
                  type="number"
                  name="sets"
                  value={exercise.sets}
                  onChange={(event) => handleExerciseChange(index, event)}
                  min={0}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Reps
                <input
                  type="number"
                  name="reps"
                  value={exercise.reps}
                  onChange={(event) => handleExerciseChange(index, event)}
                  min={0}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Weight
                <input
                  type="number"
                  name="weight"
                  value={exercise.weight}
                  onChange={(event) => handleExerciseChange(index, event)}
                  min={0}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <div className="text-sm text-slate-600">
                <strong>Exercise Total:</strong> {exerciseTotals[index] ?? "—"}
              </div>
              <button
                type="button"
                onClick={() => removeExercise(index)}
                className="inline-flex w-fit items-center rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300"
              >
                Remove exercise
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="mt-4 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
          >
            Add exercise
          </button>
        </fieldset>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Duration (minutes)
          <input
            type="number"
            name="duration"
            value={formState.duration}
            onChange={handleChange}
            min={0}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Notes
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        {error ? (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? editingWorkout
              ? "Updating..."
              : "Saving..."
            : editingWorkout
            ? "Update workout"
            : "Save workout"}
        </button>
      </form>
    </section>
  );
}

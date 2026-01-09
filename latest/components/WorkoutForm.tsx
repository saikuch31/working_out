"use client";

import { useMemo, useState } from "react";

type WorkoutFormProps = {
  onCreated: (workout: WorkoutEntry) => void;
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

const TAG_KEYWORDS: Record<string, string> = {
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
};

function inferTagsFromTitle(title: string) {
  const tokens = title
    .toLowerCase()
    .replace(/&/g, "and")
    .split(/[^a-z]+/)
    .filter(Boolean);
  const found = new Set<string>();
  tokens.forEach((token) => {
    const tag = TAG_KEYWORDS[token];
    if (tag) found.add(tag);
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

export default function WorkoutForm({ onCreated }: WorkoutFormProps) {
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

  const inferredTags = useMemo(() => inferTagsFromTitle(formState.title), [formState.title]);

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

      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message?.error ?? "Failed to create workout");
      }

      const created = (await response.json()) as WorkoutEntry;
      onCreated(created);
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
    setFormState((prev) => {
      if (name !== "title") {
        return { ...prev, [name]: value };
      }

      const nextTitle = value;
      if (hasEditedTags) {
        return { ...prev, title: nextTitle };
      }

      const suggested = inferTagsFromTitle(nextTitle).join(", ");
      return {
        ...prev,
        title: nextTitle,
        tagsInput: suggested,
      };
    });
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
    <section>
      <h2>Add Workout</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Title
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={handleChange}
            placeholder="Push day"
            required
          />
        </label>
        <label>
          Category
          <input
            type="text"
            name="category"
            value={formState.category}
            onChange={handleChange}
            placeholder="Strength"
            required
          />
        </label>
        <label>
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
          />
        </label>
        {inferredTags.length > 0 && hasEditedTags ? (
          <div>
            <span>Suggested from title: {inferredTags.join(", ")}</span>
            <button
              type="button"
              onClick={() => {
                setFormState((prev) => ({
                  ...prev,
                  tagsInput: inferredTags.join(", "),
                }));
                setHasEditedTags(false);
              }}
            >
              Use suggested
            </button>
          </div>
        ) : null}
        <fieldset>
          <legend>Exercises</legend>
          {formState.exercises.map((exercise, index) => (
            <div key={`exercise-${index}`}>
              <label>
                Exercise name
                <input
                  type="text"
                  name="name"
                  value={exercise.name}
                  onChange={(event) => handleExerciseChange(index, event)}
                  placeholder="Bench Press"
                />
              </label>
              <label>
                Sets
                <input
                  type="number"
                  name="sets"
                  value={exercise.sets}
                  onChange={(event) => handleExerciseChange(index, event)}
                  min={0}
                />
              </label>
              <label>
                Reps
                <input
                  type="number"
                  name="reps"
                  value={exercise.reps}
                  onChange={(event) => handleExerciseChange(index, event)}
                  min={0}
                />
              </label>
              <label>
                Weight
                <input
                  type="number"
                  name="weight"
                  value={exercise.weight}
                  onChange={(event) => handleExerciseChange(index, event)}
                  min={0}
                />
              </label>
              <div>
                <strong>Exercise Total:</strong> {exerciseTotals[index] ?? "—"}
              </div>
              <button type="button" onClick={() => removeExercise(index)}>
                Remove exercise
              </button>
            </div>
          ))}
          <button type="button" onClick={addExercise}>
            Add exercise
          </button>
        </fieldset>
        <label>
          Duration (minutes)
          <input
            type="number"
            name="duration"
            value={formState.duration}
            onChange={handleChange}
            min={0}
          />
        </label>
        <label>
          Notes
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            rows={3}
          />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save workout"}
        </button>
      </form>
    </section>
  );
}

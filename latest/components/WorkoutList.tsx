"use client";

import type { WorkoutEntry } from "@/components/WorkoutForm";

type WorkoutListProps = {
  workouts: WorkoutEntry[];
  isLoading: boolean;
  error: string | null;
  onEdit?: (workout: WorkoutEntry) => void;
  onDelete?: (workout: WorkoutEntry) => void;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function WorkoutList({ workouts, isLoading, error, onEdit, onDelete }: WorkoutListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-900">Workouts</h2>
      {isLoading ? <p className="mt-3 text-sm text-slate-600">Loading...</p> : null}
      {error ? (
        <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {!isLoading && workouts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No workouts yet.</p>
      ) : null}
      <ul className="mt-5 grid gap-4">
        {workouts.map((workout) => (
          <li
            key={workout.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <strong className="text-base text-slate-900">{workout.title}</strong>{" "}
                <span className="text-sm text-slate-600">({workout.category})</span>
                <div className="text-sm text-slate-600">{formatDate(workout.date)}</div>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(workout)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(workout)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            {workout.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {workout.tags.map((tag) => (
                  <span key={tag.id} className="rounded-full border border-slate-200 px-2 py-0.5">
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-3">
              {workout.exercises.length === 0 ? (
                <div className="text-sm text-slate-500">No exercises</div>
              ) : (
                <ol className="grid gap-2 text-sm text-slate-700">
                  {workout.exercises.map((exercise) => (
                    <li key={exercise.id}>
                      <span className="font-medium text-slate-900">{exercise.name}</span>
                      {exercise.sets != null && exercise.reps != null
                        ? ` - ${exercise.sets} sets x ${exercise.reps} reps`
                        : ""}
                      {exercise.weight != null ? ` @ ${exercise.weight}` : ""}
                      {exercise.totalWeight != null ? ` · Total ${exercise.totalWeight}` : ""}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {workout.duration != null ? <span>Duration: {workout.duration} min</span> : null}
              {workout.notes ? <span>Notes: {workout.notes}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

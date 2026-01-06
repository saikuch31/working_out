"use client";

import type { WorkoutEntry } from "@/components/WorkoutForm";

type WorkoutListProps = {
  workouts: WorkoutEntry[];
  isLoading: boolean;
  error: string | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function WorkoutList({ workouts, isLoading, error }: WorkoutListProps) {
  return (
    <section>
      <h2>Workouts</h2>
      {isLoading ? <p>Loading...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!isLoading && workouts.length === 0 ? <p>No workouts yet.</p> : null}
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            <strong>{workout.title}</strong> ({workout.category}) -{" "}
            {formatDate(workout.date)}
            <div>
              {workout.exercises.length === 0 ? (
                <div>No exercises</div>
              ) : (
                <ol>
                  {workout.exercises.map((exercise) => (
                    <li key={exercise.id}>
                      {exercise.name}
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
            {workout.duration != null ? <div>Duration: {workout.duration} min</div> : null}
            {workout.notes ? <div>Notes: {workout.notes}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import type { SportSession } from "@/components/SportForm";

type SportListProps = {
  sessions: SportSession[];
  isLoading: boolean;
  error: string | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function SportList({ sessions, isLoading, error }: SportListProps) {
  return (
    <section>
      <h2>Sports Sessions</h2>
      {isLoading ? <p>Loading...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!isLoading && sessions.length === 0 ? <p>No sports sessions yet.</p> : null}
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>{session.title}</strong> - {formatDate(session.date)}
            <div>Intensity: {session.intensity.toLowerCase()}</div>
            {session.duration != null ? <div>Duration: {session.duration} min</div> : null}
            {session.notes ? <div>Notes: {session.notes}</div> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

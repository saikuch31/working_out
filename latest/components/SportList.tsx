"use client";

import type { SportSession } from "@/components/SportForm";

type SportListProps = {
  sessions: SportSession[];
  isLoading: boolean;
  error: string | null;
  onEdit?: (session: SportSession) => void;
  onDelete?: (session: SportSession) => void;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function SportList({ sessions, isLoading, error, onEdit, onDelete }: SportListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-900">Sports Sessions</h2>
      {isLoading ? <p className="mt-3 text-sm text-slate-600">Loading...</p> : null}
      {error ? (
        <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {!isLoading && sessions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No sports sessions yet.</p>
      ) : null}
      <ul className="mt-5 grid gap-4">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <strong className="text-base text-slate-900">{session.title}</strong>
                <div className="text-sm text-slate-600">{formatDate(session.date)}</div>
              </div>
              <div className="flex gap-2">
                {onEdit ? (
                  <button
                    onClick={() => onEdit(session)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400"
                  >
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    onClick={() => onDelete(session)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-2 inline-flex rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold uppercase text-slate-500">
              {session.intensity.toLowerCase()}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {session.duration != null ? <span>Duration: {session.duration} min</span> : null}
              {session.notes ? <span>Notes: {session.notes}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

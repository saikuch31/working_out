"use client";

import { useEffect, useState } from "react";

export type SportSession = {
  id: string;
  date: string;
  title: string;
  duration: number | null;
  intensity: "LOW" | "MEDIUM" | "HIGH";
  notes: string | null;
  createdAt: string;
};

type SportFormProps = {
  onCreated: (session: SportSession) => void;
  onUpdated?: (session: SportSession) => void;
  editingSession?: SportSession | null;
};

type FormState = {
  date: string;
  title: string;
  duration: string;
  intensity: "LOW" | "MEDIUM" | "HIGH";
  notes: string;
};

const initialFormState: FormState = {
  date: "",
  title: "",
  duration: "",
  intensity: "MEDIUM",
  notes: "",
};

function toNumberOrNull(value: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function SportForm({ onCreated, onUpdated, editingSession }: SportFormProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSession) {
      setFormState({
        date: editingSession.date.split("T")[0],
        title: editingSession.title,
        duration: editingSession.duration?.toString() ?? "",
        intensity: editingSession.intensity,
        notes: editingSession.notes ?? "",
      });
    } else {
      setFormState(initialFormState);
    }
  }, [editingSession]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        date: formState.date,
        title: formState.title.trim(),
        duration: toNumberOrNull(formState.duration),
        intensity: formState.intensity,
        notes: formState.notes.trim() || null,
      };

      const response = await fetch(
        editingSession ? `/api/sports/${editingSession.id}` : "/api/sports",
        {
          method: editingSession ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message?.error ?? "Failed to create sports session");
      }

      const result = (await response.json()) as SportSession;
      if (editingSession) {
        onUpdated?.(result);
      } else {
        onCreated(result);
      }
      setFormState(initialFormState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <h2 className="text-xl font-semibold text-slate-900">
        {editingSession ? "Edit Sport Session" : "Add Sport Session"}
      </h2>
      <p className="mt-1 text-sm text-slate-600">Log sports you play instead of lifting.</p>
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
            placeholder="Pickup basketball"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
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
          Intensity
          <select
            name="intensity"
            value={formState.intensity}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
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
            ? editingSession
              ? "Updating..."
              : "Saving..."
            : editingSession
            ? "Update session"
            : "Save session"}
        </button>
      </form>
    </section>
  );
}

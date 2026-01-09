"use client";

import { useState } from "react";

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

export default function SportForm({ onCreated }: SportFormProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const response = await fetch("/api/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message?.error ?? "Failed to create sports session");
      }

      const created = (await response.json()) as SportSession;
      onCreated(created);
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
    <section>
      <h2>Add Sport Session</h2>
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
            placeholder="Pickup basketball"
            required
          />
        </label>
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
          Intensity
          <select name="intensity" value={formState.intensity} onChange={handleChange}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label>
          Notes
          <textarea name="notes" value={formState.notes} onChange={handleChange} rows={3} />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save session"}
        </button>
      </form>
    </section>
  );
}

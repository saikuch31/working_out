import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ExerciseInput = {
  name: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  totalWeight?: number | null;
};

type TagInput = string;

function computeTotalWeight(sets?: number | null, reps?: number | null, weight?: number | null) {
  if (sets == null || reps == null || weight == null) return null;
  return sets * reps * weight;
}

function mapExercises(exercises: ExerciseInput[] | undefined) {
  if (!exercises || exercises.length === 0) return [];
  return exercises.map((exercise) => ({
    name: exercise.name,
    sets: exercise.sets ?? null,
    reps: exercise.reps ?? null,
    weight: exercise.weight ?? null,
    totalWeight:
      exercise.totalWeight ?? computeTotalWeight(exercise.sets, exercise.reps, exercise.weight),
  }));
}

function normalizeTags(input: unknown) {
  if (input == null) return undefined;
  if (!Array.isArray(input)) return null;
  const tags = input
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  if (tags.length === 0) return [];
  return Array.from(new Set(tags));
}

function mapTags(tags: TagInput[] | undefined) {
  if (!tags || tags.length === 0) return undefined;
  return tags.map((name) => ({
    where: { name },
    create: { name },
  }));
}

function normalizeExercises(input: unknown) {
  if (input == null) return undefined;
  if (!Array.isArray(input)) return null;
  if (input.some((item) => !item || typeof item.name !== "string" || item.name.trim() === "")) {
    return null;
  }
  return input as ExerciseInput[];
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { date, title, category, duration, notes } = body ?? {};
    const exercises = normalizeExercises(body?.exercises);
    const tags = normalizeTags(body?.tags);
    const shouldReplaceExercises = exercises !== undefined;
    const shouldReplaceTags = tags !== undefined;

    if (exercises === null) {
      return NextResponse.json(
        { error: "exercises must be an array with a name for each exercise" },
        { status: 400 }
      );
    }

    if (tags === null) {
      return NextResponse.json(
        { error: "tags must be an array of strings" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (shouldReplaceExercises) {
        await tx.exercise.deleteMany({ where: { workoutId: id } });
      }

      if (shouldReplaceTags) {
        await tx.workout.update({
          where: { id },
          data: {
            tags: { set: [] },
          },
        });
      }

      return tx.workout.update({
        where: { id },
        data: {
          date: date ? new Date(date) : undefined,
          title,
          category,
          duration,
          notes,
          exercises: shouldReplaceExercises
            ? {
                create: mapExercises(exercises),
              }
            : undefined,
          tags: shouldReplaceTags
            ? {
                connectOrCreate: mapTags(tags),
              }
            : undefined,
        },
        include: { exercises: true, tags: true },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update workout" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const deleted = await prisma.workout.delete({
      where: { id },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
  }
}

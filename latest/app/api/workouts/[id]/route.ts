import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ExerciseInput = {
  name: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  totalWeight?: number | null;
};

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

function normalizeExercises(input: unknown) {
  if (input == null) return undefined;
  if (!Array.isArray(input)) return null;
  if (input.some((item) => !item || typeof item.name !== "string" || item.name.trim() === "")) {
    return null;
  }
  return input as ExerciseInput[];
}

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const body = await request.json();
    const { date, title, category, duration, notes } = body ?? {};
    const exercises = normalizeExercises(body?.exercises);
    const shouldReplaceExercises = exercises !== undefined;

    if (exercises === null) {
      return NextResponse.json(
        { error: "exercises must be an array with a name for each exercise" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (shouldReplaceExercises) {
        await tx.exercise.deleteMany({ where: { workoutId: id } });
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
        },
        include: { exercises: true },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update workout" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const deleted = await prisma.workout.delete({
      where: { id },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
  }
}

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

export async function GET() {
  try {
    const workouts = await prisma.workout.findMany({
      include: { exercises: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, title, category, duration, notes } = body ?? {};
    const exercises = normalizeExercises(body?.exercises);

    if (!date || !title || !category) {
      return NextResponse.json(
        { error: "date, title, and category are required" },
        { status: 400 }
      );
    }

    if (exercises === null) {
      return NextResponse.json(
        { error: "exercises must be an array with a name for each exercise" },
        { status: 400 }
      );
    }

    const created = await prisma.workout.create({
      data: {
        date: new Date(date),
        title,
        category,
        duration: duration ?? null,
        notes: notes ?? null,
        exercises: {
          create: mapExercises(exercises),
        },
      },
      include: { exercises: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }
}

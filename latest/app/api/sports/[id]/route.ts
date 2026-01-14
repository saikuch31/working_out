import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INTENSITIES = ["LOW", "MEDIUM", "HIGH"] as const;

type Intensity = (typeof INTENSITIES)[number];

type SportInput = {
  date?: string;
  title?: string;
  duration?: number | null;
  intensity?: Intensity;
  notes?: string | null;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeIntensity(input: unknown): Intensity | null {
  if (typeof input !== "string") return null;
  const upper = input.toUpperCase();
  return INTENSITIES.includes(upper as Intensity) ? (upper as Intensity) : null;
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as SportInput;
    const intensity = body.intensity ? normalizeIntensity(body.intensity) : undefined;

    if (body.intensity && !intensity) {
      return NextResponse.json({ error: "intensity must be LOW, MEDIUM, or HIGH" }, { status: 400 });
    }

    const updated = await prisma.sportSession.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        title: body.title?.trim(),
        duration: body.duration ?? undefined,
        intensity,
        notes: body.notes?.trim() || undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sports session" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const deleted = await prisma.sportSession.delete({
      where: { id },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sports session" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const INTENSITIES = ["LOW", "MEDIUM", "HIGH"] as const;

type Intensity = (typeof INTENSITIES)[number];

type SportInput = {
  date: string;
  title: string;
  duration?: number | null;
  intensity: Intensity;
  notes?: string | null;
};

function normalizeIntensity(input: unknown): Intensity | null {
  if (typeof input !== "string") return null;
  const upper = input.toUpperCase();
  return INTENSITIES.includes(upper as Intensity) ? (upper as Intensity) : null;
}

export async function GET() {
  try {
    const sessions = await prisma.sportSession.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sports sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SportInput>;
    const intensity = normalizeIntensity(body.intensity);

    if (!body.date || !body.title || !intensity) {
      return NextResponse.json(
        { error: "date, title, and intensity are required" },
        { status: 400 }
      );
    }

    const created = await prisma.sportSession.create({
      data: {
        date: new Date(body.date),
        title: body.title.trim(),
        duration: body.duration ?? null,
        intensity,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create sports session" }, { status: 500 });
  }
}

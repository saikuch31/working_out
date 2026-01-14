import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseDateKey(dateKey: unknown) {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null;
  }
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export async function GET() {
  try {
    const restDays = await prisma.restDay.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(restDays);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rest days" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = parseDateKey(body?.date);

    if (!date) {
      return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const created = await prisma.restDay.upsert({
      where: { date },
      create: { date },
      update: {},
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create rest day" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const date = parseDateKey(body?.date);

    if (!date) {
      return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    await prisma.restDay.deleteMany({
      where: { date },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete rest day" }, { status: 500 });
  }
}

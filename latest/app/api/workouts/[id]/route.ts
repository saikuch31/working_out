import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ ok: true, message: "Update workout" });
}

export async function DELETE() {
  return NextResponse.json({ ok: true, message: "Delete workout" });
}

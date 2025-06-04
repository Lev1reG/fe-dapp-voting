// app/api/candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCandidatesBySession } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId query missing" }, { status: 400 });
  }

  const list = getCandidatesBySession(sessionId);
  // Kembalikan array kandidat
  return NextResponse.json({ candidates: list });
}

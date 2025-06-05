// app/api/oracle/candidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    /**
     * body:
     * {
     *   sessionId: string,
     *   candidateAddr: string,
     *   candidateName: string,
     *   txHash: string (optional)
     * }
     */
    const { sessionId, candidateAddr, candidateName } = body;
    if (!sessionId || !candidateAddr || !candidateName) {
      return NextResponse.json(
        { error: "Missing field di body" },
        { status: 400 }
      );
    }

    // Create new candidate in database
    const newCandidate = await db.candidate.create({
      data: {
        sessionId,
        candidateName,
        candidateAddr,
      },
    });

    console.log("New candidate added:", newCandidate);

    return NextResponse.json({ 
      ok: true, 
      data: newCandidate 
    });
  } catch (err) {
    console.error("Error di /api/oracle/candidate:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

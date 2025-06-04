// app/api/oracle/candidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addCandidate } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    /**
     * body:
     * {
     *   sessionId: string,
     *   candidate: string,
     *   name: string,
     *   txHash: string
     * }
     */
    const { sessionId, candidate, name, txHash } = body;
    if (!sessionId || !candidate || !name || !txHash) {
      return NextResponse.json(
        { error: "Missing field di body" },
        { status: 400 }
      );
    }

    addCandidate({
      sessionId,
      address: candidate,
      name,
      txHash,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error di /api/oracle/candidate:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

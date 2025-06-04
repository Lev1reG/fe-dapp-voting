// lib/db.ts
export type Candidate = {
  sessionId: string;
  address: string;
  name: string;
  txHash: string;
};

const candidates: Candidate[] = [];

// Simpel func untuk tambah kandidat
export function addCandidate(c: Candidate) {
  candidates.push(c);
}

// Ambil kandidat by sessionId
export function getCandidatesBySession(sessionId: string): Candidate[] {
  return candidates.filter((c) => c.sessionId === sessionId);
}

// (Opsional) fungsi lain: hapus, update, dsb.

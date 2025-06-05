"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ConnectWallet from "@/components/allPage/ConnectWallet";
import useVotingContract from "@/hooks/use-voting-contract";

// Struktur kandidat on‐chain sesuai ABI: setiap index sessionCandidates[sessionId][i]
// mengandung { addr, name }
type OnChainCandidate = {
  addr: `0x${string}`;
  name: string;
};

interface MainPageProps {
  sessionId: string; // misal "1"
}

export default function Voting({ sessionId }: MainPageProps) {
  const votingContract = useVotingContract();
  const {
    currentAccount,
    useGetCandidates,
    useIsVotingOpen,
    useHasVoted,
    useIsEligible,
    vote,
    isPending,
  } = votingContract;
  const { isConnected } = useAccount();

  // 1. Simpan daftar kandidat on‐chain dan jumlah suara (voteCounts) masing‐masing
  const [candidates, setCandidates] = useState<OnChainCandidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, bigint>>({});
  // voteCounts[candidateAddr] = jumlah suara

  // 2. Status‐status pemilihan
  const [isSessionOpen, setIsSessionOpen] = useState<boolean>(false);
  const [hasUserVoted, setHasUserVoted] = useState<boolean>(false);
  const [isUserEligible, setIsUserEligible] = useState<boolean>(false);

  // 3. Hooks untuk membaca data dari smart contract
  const { data: onChainData } = useGetCandidates(Number(sessionId));
  const { data: openData } = useIsVotingOpen(Number(sessionId));
  const { data: votedData } = useHasVoted(Number(sessionId));
  const { data: eligibleData } = useIsEligible(Number(sessionId));

  // 4. Set up side-effect ketika data onChainData (getCandidates) berubah
  useEffect(() => {
    if (!onChainData) return;
    const [addrs, names] = onChainData as [Array<`0x${string}`>, string[]];

    // Satukan ke Array<OnChainCandidate>
    const merged: OnChainCandidate[] = addrs.map((addr, i) => ({
      addr,
      name: names[i],
    }));
    setCandidates(merged);

    // Setelah daftar kandidat berubah, kita fetch voteCounts per kandidat
    const fetchCounts = async () => {
      const countsObj: Record<string, bigint> = {};
      for (const cand of merged) {
        const { data: count } = await votingContract.useGetVoteCount(
          Number(sessionId),
          cand.addr
        );
        countsObj[cand.addr] =
          count != null ? BigInt(count.toString()) : BigInt(0);
      }
      setVoteCounts(countsObj);
    };

    fetchCounts();
  }, [onChainData, sessionId, votingContract]);

  // 5. Side-effect untuk mengupdate status voting (open/closed), hasVoted, isEligible
  useEffect(() => {
    if (typeof openData === "boolean") {
      setIsSessionOpen(openData);
    }
  }, [openData]);

  useEffect(() => {
    if (typeof votedData === "boolean") {
      setHasUserVoted(votedData);
    }
  }, [votedData]);

  useEffect(() => {
    if (typeof eligibleData === "boolean") {
      setIsUserEligible(eligibleData);
    }
  }, [eligibleData]);

  // 6. Handler ketika user menekan tombol "Vote" untuk kandidat tertentu
  const handleVote = async (candidateAddr: string) => {
    if (!isConnected || !currentAccount) {
      alert("🔒 Silakan connect wallet terlebih dahulu!");
      return;
    }
    if (!isSessionOpen) {
      alert("⛔ Voting untuk sesi ini sudah ditutup.");
      return;
    }
    if (hasUserVoted) {
      alert("❌ Anda sudah pernah memilih di sesi ini.");
      return;
    }
    if (!isUserEligible) {
      alert("🚫 Anda tidak termasuk pemilih yang berhak.");
      return;
    }

    try {
      await vote(Number(sessionId), candidateAddr);
    } catch (err: unknown) {
      console.error("Error saat memanggil vote():", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("❌ Gagal mengirim vote: " + errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen justify-center items-start bg-gray-100 p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        {/* --- Header: Judul + Connect Button --- */}
        <ConnectWallet title={"Voting DApp"} />

        <hr className="border-gray-200 mb-6" />

        {/* --- Status Sesi & User --- */}
        <div className="mb-4">
          <p className="text-lg text-gray-700">
            <span className="font-medium">Session #{sessionId}</span>{" "}
            {isConnected && currentAccount ? (
              <span className="text-sm text-gray-500 font-mono">
                Connected: {currentAccount.slice(0, 6)}...
                {currentAccount.slice(-4)}
              </span>
            ) : (
              <span className="text-sm text-red-500">
                Wallet belum terkoneksi
              </span>
            )}
          </p>
          <p className="text-sm mt-1">
            Status Voting:{" "}
            {isSessionOpen ? (
              <span className="text-green-600 font-semibold">Open</span>
            ) : (
              <span className="text-red-600 font-semibold">Closed</span>
            )}
          </p>
          {isConnected && (
            <p className="text-sm">
              {hasUserVoted ? (
                <span className="text-yellow-800">✅ Anda sudah memilih</span>
              ) : (
                <span className="text-blue-700">Anda belum memilih</span>
              )}
            </p>
          )}
          {isConnected && (
            <p className="text-sm">
              {isUserEligible ? (
                <span className="text-green-700">Anda eligible</span>
              ) : (
                <span className="text-red-700">Anda tidak eligible</span>
              )}
            </p>
          )}
        </div>

        {/* --- Daftar Kandidat dan Vote Button --- */}
        {onChainData == null ? (
          <p className="text-gray-500">Loading candidates…</p>
        ) : candidates.length === 0 ? (
          <p className="text-gray-500">Belum ada kandidat terdaftar.</p>
        ) : (
          <ul className="space-y-4">
            {candidates.map((cand) => (
              <li
                key={cand.addr}
                className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {cand.name}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">{cand.addr}</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Suara:{" "}
                    {voteCounts[cand.addr] !== undefined
                      ? voteCounts[cand.addr].toString()
                      : "-"}
                  </p>
                </div>
                <button
                  onClick={() => handleVote(cand.addr)}
                  disabled={
                    isPending ||
                    !isSessionOpen ||
                    hasUserVoted ||
                    !isUserEligible
                  }
                  className={`px-4 py-2 rounded-lg text-white transition 
                    ${
                      isPending ||
                      !isSessionOpen ||
                      hasUserVoted ||
                      !isUserEligible
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                  {isPending ? "Voting…" : "Vote"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

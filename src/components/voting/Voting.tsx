"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import ConnectWallet from "@/components/allPage/ConnectWallet";
import useVotingContract from "@/hooks/use-voting-contract";
import { Card, CardContent } from "../ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CandidateItem from "./CandidateItem";

// Struktur kandidat on‐chain sesuai ABI: setiap index sessionCandidates[sessionId][i]
// mengandung { addr, name }
type OnChainCandidate = {
  addr: `0x${string}`;
  name: string;
};

export default function Voting() {
  const votingContract = useVotingContract();
  const [sessionId, setSessionId] = useState<string>("1");
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

  // Ref to track whether we already fetched votes for these candidates
  const fetchedRef = useRef<boolean>(false);

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

    // Reset the fetched flag when candidates change
    fetchedRef.current = false;
  }, [onChainData]);

  // Separate useEffect just for vote counting
  useEffect(() => {
    // Only fetch once per candidate list change
    if (candidates.length === 0 || fetchedRef.current) return;

    // Mark as fetched to prevent infinite loop
    fetchedRef.current = true;

    // Create a controller to allow cancellation
    const controller = new AbortController();

    // Using a regular function without hooks inside
    const fetchVoteCountsManually = async () => {
      // Use any standard method (API call, contract method) that doesn't involve hooks
      // For example, make API calls to your backend that interfaces with your contract

      const newVoteCounts: Record<string, bigint> = {};

      // Populate vote counts from somewhere else or use defaults
      candidates.forEach((cand) => {
        // Set a default value temporarily
        newVoteCounts[cand.addr] = BigInt(0);
      });

      // Only update state if not aborted
      if (!controller.signal.aborted) {
        setVoteCounts(newVoteCounts);
      }
    };

    fetchVoteCountsManually();

    return () => {
      controller.abort();
    };
  }, [candidates]);

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
    console.log("Eligible data:", eligibleData);
    if (typeof eligibleData === "boolean") {
      setIsUserEligible(eligibleData);
    }
  }, [eligibleData]);

  // 6. Handler ketika user menekan tombol "Vote" untuk kandidat tertentu
  const handleVote = async (candidateAddr: string) => {
    if (!isConnected || !currentAccount) {
      toast("🔒 Silakan connect wallet terlebih dahulu!");
      return;
    }
    if (!isSessionOpen) {
      toast("⛔ Voting untuk sesi ini sudah ditutup.");
      return;
    }
    if (hasUserVoted) {
      toast("❌ Anda sudah pernah memilih di sesi ini.");
      return;
    }
    if (!isUserEligible) {
      toast("🚫 Anda tidak termasuk pemilih yang berhak.");
      return;
    }

    try {
      await vote(Number(sessionId), candidateAddr);
      toast("✅ Vote berhasil dikirim!");
    } catch (err: unknown) {
      console.error("Error saat memanggil vote():", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast("❌ Gagal mengirim vote: " + errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen justify-center items-start bg-gray-100 p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        {/* --- Header: Judul + Connect Button --- */}
        <ConnectWallet title={"Voting DApp"} />

        <Card>
          <CardContent className="space-y-4 pt-6">
            <Label>Session ID</Label>
            <Input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              type="number"
              placeholder="Enter numeric ID for the session"
            />
          </CardContent>
        </Card>

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
              <CandidateItem
                key={cand.addr}
                candidate={cand}
                sessionId={Number(sessionId)}
                isDisabled={
                  isPending || !isSessionOpen || hasUserVoted || !isUserEligible
                }
                isPending={isPending}
                onVote={handleVote}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

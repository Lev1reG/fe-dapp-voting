"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useTransactionReceipt,
} from "wagmi";

import VotingABI from "@/contracts/Voting.json";

import ConnectWallet from "@/components/allPage/ConnectWallet";

// --- Ganti dengan address kontrak Voting Anda (hasil deploy Foundry) ---
const VOTING_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

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
  const { address, isConnected } = useAccount();

  // 1. Simpan daftar kandidat on‐chain dan jumlah suara (voteCounts) masing‐masing
  const [candidates, setCandidates] = useState<OnChainCandidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, bigint>>({});
  // voteCounts[candidateAddr] = jumlah suara

  // 2. Status‐status pemilihan
  const [isSessionOpen, setIsSessionOpen] = useState<boolean>(false);
  const [hasUserVoted, setHasUserVoted] = useState<boolean>(false);
  const [isUserEligible, setIsUserEligible] = useState<boolean>(false);

  // 3. Wagmi Read Contracts untuk memanggil fungsi‐fungsi view di Smart Contract
  // 3a) getCandidates(sessionId) → mengembalikan (address[] addrs, string[] names)
  const { data: onChainData, refetch: refetchCandidates } = useContractRead({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "getCandidates",
    args: [BigInt(sessionId)],
    watch: true, // agar otomatis update saat chain new block
  });

  // 3b) isVotingOpen(sessionId) → bool
  const { data: openData, refetch: refetchOpen } = useContractRead({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "isVotingOpen",
    args: [BigInt(sessionId)],
    watch: true,
  });

  // 3c) hasVoted(sessionId, user) → bool
  const { data: votedData, refetch: refetchHasVoted } = useContractRead({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "hasVoted",
    args: [BigInt(sessionId), address!],
    enabled: isConnected && !!address, // hanya baca kalau wallet sudah connect
    watch: true,
  });

  // 3d) isEligible(sessionId, user) → bool
  const { data: eligibleData, refetch: refetchEligible } = useContractRead({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "isEligible",
    args: [BigInt(sessionId), address!],
    enabled: isConnected && !!address,
    watch: true,
  });

  // 4. Wagmi Write Contract untuk memanggil fungsi vote(sessionId, candidateAddr)
  const { write: voteWrite, isLoading: isVoting } = useContractWrite({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "vote",
    args: [BigInt(sessionId), "0x0000000000000000000000000000000000000000"], // placeholder
  });

  // 5. Wagmi Transaction Receipt untuk memantau status transaksi paling baru
  const [txHash, setTxHash] = useState<string>("");
  const {
    data: receiptData,
    isLoading: isLoadingReceipt,
    isSuccess: txSuccess,
  } = useTransactionReceipt({
    hash: txHash,
  });

  // 6. Set up side-effect ketika data onChainData (getCandidates) berubah
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
        const count: bigint = await refetchVoteCount?.({
          args: [BigInt(sessionId), cand.addr],
        }).then((res) => (res.data as bigint) ?? BigInt(0));
        countsObj[cand.addr] = count;
      }
      setVoteCounts(countsObj);
    };

    // definisikan refetchVoteCount hook:
    //  - tidak otomatis dijalankan, kita gunakan `useContractRead` dengan enabled false
    //  - lalu panggil secara manual di atas
    fetchCounts();
  }, [onChainData]);

  // 7. Hook untuk memanggil getVoteCount satu per satu (enabled: false → nanti dipanggil manual)
  const { refetch: refetchVoteCount } = useContractRead({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VotingABI,
    functionName: "getVoteCount",
    args: [BigInt(sessionId), "0x0000000000000000000000000000000000000000"], // placeholder
    enabled: false,
  });

  // 8. Side-effect untuk mengupdate status voting (open/closed), hasVoted, isEligible
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

  // 9. Handler ketika user menekan tombol "Vote" untuk kandidat tertentu
  const handleVote = async (candidateAddr: string) => {
    if (!isConnected || !address) {
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
      const { hash } = await voteWrite({
        args: [BigInt(sessionId), candidateAddr as `0x${string}`],
      });
      setTxHash(hash);
    } catch (err: any) {
      console.error("Error saat memanggil vote():", err);
      alert("❌ Gagal mengirim vote: " + (err.message || String(err)));
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
            {isConnected && address ? (
              <span className="text-sm text-gray-500 font-mono">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
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
          {txHash && (
            <p className="text-sm text-gray-500 mt-2">
              {isLoadingReceipt
                ? "⌛ Menunggu konfirmasi transaksi..."
                : txSuccess
                ? "✅ Transaksi berhasil!"
                : "❌ Transaksi gagal / belum terkonfirmasi"}
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
                    isVoting ||
                    isLoadingReceipt ||
                    !isSessionOpen ||
                    hasUserVoted ||
                    !isUserEligible
                  }
                  className={`px-4 py-2 rounded-lg text-white transition 
                    ${
                      isVoting ||
                      isLoadingReceipt ||
                      !isSessionOpen ||
                      hasUserVoted ||
                      !isUserEligible
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                  {isVoting || isLoadingReceipt ? "Voting…" : "Vote"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

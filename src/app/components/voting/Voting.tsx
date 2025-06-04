"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  //   useReadContract,
  useWriteContract,
  useTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// import VotingABI from "@/contract/Voting.json";

// --- 1) Ganti dengan address kontrak Voting hasil deploy Foundry kamu ---
const VOTING_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// --- 2) Tipe data Candidate (sesuai format backend) ---
type Candidate = {
  sessionId: string;
  address: string;
  name: string;
  txHash: string;
};

interface MainPageProps {
  sessionId: string;
}

export default function MainPage({ sessionId }: MainPageProps) {
  const { address, isConnected } = useAccount();

  // --- State kandidat dari backend Next.js API ---
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // --- Wagmi Read Contract: (opsional) bisa dipakai untuk fetch voteCount nanti ---
  //    Contoh:
  //    const { data: someCount } = useReadContract({
  //      address: VOTING_CONTRACT_ADDRESS,
  //      abi: VotingABI,
  //      functionName: "getVoteCount",
  //      args: [Number(sessionId), candidateAddress],
  //    });

  // --- Wagmi Write Contract: untuk panggil fungsi `vote(sessionId, candidateAddr)` ---
  //    Kita tidak perlu `usePrepareContractWrite` karena langsung pakai `useWriteContract`.
  //   const { writeContract, isPending } = useWriteContract({
  //     address: VOTING_CONTRACT_ADDRESS,
  //     abi: VotingABI.abi,
  //     functionName: "vote",
  //     // args di‐pass nanti dalam `writeContract({ args: [...] })`
  //   });

  // --- Wagmi Transaction Receipt untuk memantau status transaksi terakhir ---
  //   const { data: txReceipt, isLoading: isLoadingReceipt, isSuccess } =
  //     useTransactionReceipt({
  //       hash: txReceiptHash, // nanti kita simpan txHash ketika writeContract dijalankan
  //     });

  // Kita simpan txHash di state untuk dipakai di useTransactionReceipt
  const [txReceiptHash, setTxReceiptHash] = useState<string>("");

  // --- 3) Fetch kandidat dari backend API Next.js `/api/candidates` ---
  //   useEffect(() => {
  //     async function fetchCandidates() {
  //       setIsFetching(true);
  //       try {
  //         const res = await fetch(`/api/candidates?sessionId=${sessionId}`);
  //         const json = await res.json();
  //         setCandidates(json.candidates || []);
  //       } catch (err) {
  //         console.error("Fetch candidates error:", err);
  //       } finally {
  //         setIsFetching(false);
  //       }
  //     }
  //     fetchCandidates();
  //   }, [sessionId, isSuccess]); // re‐fetch setelah ada vote yang sukses (opsional)

  // --- 4) Handler Vote: panggil `writeContract` dengan argumen yang benar ---
  //   const handleVote = async (candidateAddr: string) => {
  //     if (!isConnected || !address) {
  //       alert("🔒 Silakan connect wallet terlebih dahulu!");
  //       return;
  //     }
  //     try {
  //       // Kirim transaksi vote(sessionId, candidateAddr)
  //       // Wagmi akan otomatis pakai signer dari wallet yang ter‐connect.
  //       const { hash } = await writeContract({ args: [BigInt(sessionId), candidateAddr as `0x${string}`] });
  //       setTxReceiptHash(hash);
  //     } catch (err: any) {
  //       console.error("Error on vote:", err);
  //       alert("❌ Gagal mengirim vote: " + (err.message || String(err)));
  //     }
  //   };

  return (
    <main className="flex min-h-screen justify-center items-start bg-gray-100 p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        {/* --- Header: Judul + Connect Button --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            🗳️ Voting DApp
          </h1>
          <ConnectButton />
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* --- Section: Tampilkan Session ID & Status Transaksi --- */}
        <div className="mb-4">
          <p className="text-lg text-gray-700">
            <span className="font-medium">Session #{sessionId}</span>{" "}
            {isConnected && address ? (
              <span className="text-sm text-gray-500 font-mono">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            ) : (
              <span className="text-sm text-red-500">
                Wallet belum connected
              </span>
            )}
          </p>
          {/* {txReceiptHash && (
            <p className="text-sm text-gray-500 mt-1">
              {isLoadingReceipt
                ? "⌛ Menunggu konfirmasi transaksi..."
                : isSuccess
                ? "✅ Transaksi berhasil!"
                : "❌ Transaksi gagal atau belum terkonfirmasi"}
            </p>
          )} */}
        </div>

        {/* --- Section: Daftar Kandidat + Tombol Vote --- */}
        {isFetching ? (
          <p className="text-gray-500">Loading candidates…</p>
        ) : candidates.length === 0 ? (
          <p className="text-gray-500">Belum ada kandidat terdaftar.</p>
        ) : (
          <ul className="space-y-4">
            {candidates.map((cand) => (
              <li
                key={cand.address}
                className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {cand.name}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">
                    {cand.address}
                  </p>
                </div>
                <button
                  //   onClick={() => handleVote(cand.address)}
                  //   disabled={isPending || isLoadingReceipt}
                  //   className={`px-4 py-2 rounded-lg text-white transition
                  //     ${
                  //       isPending || isLoadingReceipt
                  //         ? "bg-gray-400 cursor-not-allowed"
                  //         : "bg-green-500 hover:bg-green-600"
                  //     }`}
                  className={`px-4 py-2 rounded-lg text-white transition`}
                >
                  {/* {isPending || isLoadingReceipt ? "Voting…" : "Vote"} */}
                  Voting
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

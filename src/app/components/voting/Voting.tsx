"use client";

import { useEffect, useState } from "react";
// import { useAccount, useConnect, useDisconnect, useSigner } from "wagmi";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ethers } from "ethers";
// import VotingABI from "../contract/Voting.json";

type Candidate = {
  sessionId: string;
  address: string;
  name: string;
  txHash: string;
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
//   const { data: signer } = useSigner();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sessionId] = useState<string>("1"); // contoh hardcoded sesi 1

  // Ambil daftar kandidat dari backend
  useEffect(() => {
    fetch(`/api/candidates?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data.candidates);
      })
      .catch((e) => console.error(e));
  }, [sessionId]);

  const votingContractAddress = "0xYourVotingContractAddressHere";

  // Fungsi untuk melakukan vote
  const handleVote = async (candidateAddr: string) => {
    // if (!signer) {
    //   alert("Silakan connect wallet dulu");
    //   return;
    // }
    try {
    //   const tx = await signer.sendTransaction({
    //     to: votingContractAddress,
    //     data: new ethers.utils.Interface(VotingABI.abi).encodeFunctionData(
    //       "vote",
    //       [Number(sessionId), candidateAddr]
    //     ),
    //   });
    //   console.log("Tx sent:", tx.hash);
    //   await tx.wait();
      console.log("Vote confirmed");
      alert("Vote sukses!");
    } catch (err: unknown) {
      console.error("Error vote:", err);
      if (err instanceof Error) {
        alert("Gagal vote: " + err.message);
      } else {
        alert("Gagal vote: Terjadi kesalahan");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🗳️ Voting DApp
        </h1>

        {/* Connect / Disconnect Wallet */}
        <div className="mb-8">
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Disconnect ({address?.slice(0, 6)}...)
            </button>
          ) : (
            <div className="space-x-2">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => connect({ connector: c })}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Connect {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-gray-300 mb-8" />

        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Session #{sessionId}
        </h2>

        <ul className="space-y-4">
          {candidates.map((cand) => (
            <li
              key={cand.address}
              className="flex items-center justify-between bg-gray-100 rounded p-4"
            >
              <div>
                <p className="font-medium text-gray-800">{cand.name}</p>
                <p className="text-sm text-gray-500">{cand.address}</p>
              </div>
              <button
                onClick={() => handleVote(cand.address)}
                disabled={!isConnected}
                className={`px-4 py-2 rounded text-white transition ${
                  isConnected
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Vote
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

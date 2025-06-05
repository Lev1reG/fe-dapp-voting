"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { ReactNode } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Sesuaikan `projectId` dengan yang kamu daftarkan di RainbowKit (atau gunakan “anonymous” untuk dev)
const config = getDefaultConfig({
  appName: "Voting DApp",
  projectId: "YOUR_PROJECT_ID", // ← ganti dengan Project ID mu
  chains: [monadTestnet],
  ssr: true,
});

export default function VotingLayout({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

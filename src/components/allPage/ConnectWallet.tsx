import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectWallet = ({ title }: { title: string }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">🗳️ {title}</h1>
      <ConnectButton />
    </div>
  );
};

export default ConnectWallet;

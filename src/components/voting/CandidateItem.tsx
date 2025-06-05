import useVotingContract from "@/hooks/use-voting-contract";

type OnChainCandidate = {
  addr: `0x${string}`;
  name: string;
};

type CandidateItemProps = {
  candidate: OnChainCandidate;
  sessionId: number;
  isDisabled: boolean;
  isPending: boolean;
  onVote: (addr: string) => void;
};

export const CandidateItem = ({
  candidate,
  sessionId,
  isDisabled,
  isPending,
  onVote,
}: CandidateItemProps) => {
  const { useGetVoteCount } = useVotingContract();

  // Now we can safely use the hook for this specific candidate
  const { data: voteCount, isLoading } = useGetVoteCount(
    sessionId,
    candidate.addr
  );

  return (
    <li className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition">
      <div>
        <p className="text-lg font-medium text-gray-800">{candidate.name}</p>
        <p className="text-sm text-gray-500 font-mono">{candidate.addr}</p>
        <p className="text-sm text-purple-700 mt-1">
          Suara:{" "}
          {isLoading ? "loading..." : voteCount ? voteCount.toString() : "0"}
        </p>
      </div>
      <button
        onClick={() => onVote(candidate.addr)}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-lg text-white transition 
          ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
      >
        {isPending ? "Voting…" : "Vote"}
      </button>
    </li>
  );
};

export default CandidateItem;

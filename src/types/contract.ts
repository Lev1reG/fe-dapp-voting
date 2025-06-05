import { UseReadContractReturnType } from 'wagmi';
import VotingABI from '@/app/contracts/Voting.json';

// Contract data structures
export interface VotingSession {
  start: bigint;
  end: bigint;
  initialized: boolean;
}

export interface Candidate {
  addr: `0x${string}`;
  name: string;
}

export interface CandidatesResult {
  addrs: readonly `0x${string}`[];
  names: readonly string[];
}

export interface Winner {
  winner: `0x${string}`;
  name: string;
  highestVotes: bigint;
}

// Generic type for ReadContract hook results
export type ReadContractResult<TFunctionName extends string, TArgs extends readonly unknown[]> = 
  UseReadContractReturnType<typeof VotingABI, TFunctionName, TArgs>;

// Hook return type
export interface VotingContractHook {
  // State
  currentAccount?: `0x${string}`;
  isAdmin: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
  
  // Write functions
  createSession: (sessionId: number, startTime: number, endTime: number) => void;
  registerCandidate: (sessionId: number, candidateAddr: string, name: string) => void;
  updateEligibility: (sessionId: number, voters: string[], eligible: boolean) => void;
  endSession: (sessionId: number) => void;
  vote: (sessionId: number, candidateAddr: string) => void;
  
  // Read hooks
  useGetCandidates: (sessionId: number) => ReadContractResult<'getCandidates', [number]>;
  useGetVoteCount: (sessionId: number, candidateAddr: string) => ReadContractResult<'getVoteCount', [number, string]>;  
  useGetWinner: (sessionId: number) => ReadContractResult<'getWinner', [number]>;
  useIsVotingOpen: (sessionId: number) => ReadContractResult<'isVotingOpen', [number]>;
  useHasVoted: (sessionId: number, voterAddr?: string) => ReadContractResult<'hasVoted', [number, string]>;
  useIsEligible: (sessionId: number, voterAddr?: string) => ReadContractResult<'isEligible', [number, string]>;
  useGetSession: (sessionId: number) => ReadContractResult<'sessions', [number]>;
}
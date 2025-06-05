import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import VotingABI from '../contracts/Voting.json';
import { VotingContractHook } from '@/types/contract';

export function useVotingContract(contractAddress: string): VotingContractHook {
  const { address: currentAccount } = useAccount();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Read admin address with proper typing
  const { data: adminAddress } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: VotingABI,
    functionName: 'admin',
  }) as { data: `0x${string}` | undefined };
  
  // Set isAdmin state based on comparison with current account
  useEffect(() => {
    if (adminAddress && currentAccount) {
      setIsAdmin(adminAddress.toLowerCase() === currentAccount.toLowerCase());
    }
  }, [adminAddress, currentAccount]);
  
  // Write contract mutation
  const { writeContract, isPending, isSuccess, error } = useWriteContract();
  
  // Admin functions
  const createSession = async (sessionId: number, startTime: number, endTime: number) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'createSession',
      args: [sessionId, startTime, endTime],
    });
  };

  const registerCandidate = async (sessionId: number, candidateAddr: string, name: string) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'registerCandidate',
      args: [sessionId, candidateAddr, name],
    });
  };

  const updateEligibility = async (sessionId: number, voters: string[], eligible: boolean) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'updateEligibility',
      args: [sessionId, voters, eligible],
    });
  };

  const endSession = async (sessionId: number) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'endSession',
      args: [sessionId],
    });
  };

  // Voter functions
  const vote = async (sessionId: number, candidateAddr: string) => {
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'vote',
      args: [sessionId, candidateAddr],
    });
  };

  // Read functions
  const useGetCandidates = (sessionId: number) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'getCandidates',
      args: [sessionId],
    });
  };

  const useGetVoteCount = (sessionId: number, candidateAddr: string) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'getVoteCount',
      args: [sessionId, candidateAddr],
    });
  };

  const useGetWinner = (sessionId: number) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'getWinner',
      args: [sessionId],
    });
  };

  const useIsVotingOpen = (sessionId: number) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'isVotingOpen',
      args: [sessionId],
    });
  };

  const useHasVoted = (sessionId: number, voterAddr: string = currentAccount || '') => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'hasVoted',
      args: [sessionId, voterAddr],
    });
  };

  const useIsEligible = (sessionId: number, voterAddr: string = currentAccount || '') => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'isEligible',
      args: [sessionId, voterAddr],
    });
  };

  const useGetSession = (sessionId: number) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: VotingABI,
      functionName: 'sessions',
      args: [sessionId],
    });
  };

  return {
    currentAccount,
    isAdmin,
    isPending,
    isSuccess,
    error,
    
    // Write functions
    createSession,
    registerCandidate,
    updateEligibility,
    endSession,
    vote,
    
    // Read hooks
    useGetCandidates,
    useGetVoteCount,
    useGetWinner,
    useIsVotingOpen,
    useHasVoted,
    useIsEligible,
    useGetSession,
  };
}

export default useVotingContract;
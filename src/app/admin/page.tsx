// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ConnectWallet from "@/components/allPage/ConnectWallet";
import { useVotingContract } from "@/hooks/use-voting-contract";

export default function AdminPage() {
  const [sessionId, setSessionId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [candidateAddr, setCandidateAddr] = useState("");
  const [candidateName, setCandidateName] = useState("");

  // Get contract functions from our custom hook
  const {
    createSession,
    registerCandidate,
    isPending,
    isSuccess,
    error,
    isAdmin
  } = useVotingContract();

  // Handle success/error notifications
  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction completed successfully!");
    }
    if (error) {
      toast.error(`Error: ${error.message || "Transaction failed"}`);
    }
  }, [isSuccess, error]);

  // Create session handler
  const handleCreateSession = async () => {
    try {
      const sessionIdNum = parseInt(sessionId);
      const startTimeNum = parseInt(startTime);
      const endTimeNum = parseInt(endTime);
      
      if (isNaN(sessionIdNum) || isNaN(startTimeNum) || isNaN(endTimeNum)) {
        toast.error("Please enter valid numbers for all fields");
        return;
      }

      await createSession(sessionIdNum, startTimeNum, endTimeNum);
    } catch (err) {
      toast.error(`Failed to create session: ${(err as Error).message}`);
    }
  };

  // Register candidate handler
  const handleRegisterCandidate = async () => {
    try {
      const sessionIdNum = parseInt(sessionId);
      
      if (isNaN(sessionIdNum) || !candidateAddr || !candidateName) {
        toast.error("Please fill all fields with valid values");
        return;
      }

      await registerCandidate(sessionIdNum, candidateAddr, candidateName);
    } catch (err) {
      toast.error(`Failed to register candidate: ${(err as Error).message}`);
    }
  };

  // Show admin-only warning if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-10">
        <ConnectWallet title={"Admin Voting DApp"} />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-4">
              <h1 className="text-xl font-bold text-red-500">Admin Access Required</h1>
              <p className="mt-2">You need admin privileges to manage voting sessions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <ConnectWallet title={"Admin Voting DApp"} />

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

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Label>Start Time (unix timestamp)</Label>
          <Input
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            type="number"
            placeholder="e.g., 1717027200"
          />

          <Label>End Time (unix timestamp)</Label>
          <Input 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)} 
            type="number"
            placeholder="e.g., 1717113600" 
          />

          <Button 
            onClick={handleCreateSession} 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Creating..." : "Create Voting Session"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Label>Candidate Address</Label>
          <Input
            value={candidateAddr}
            onChange={(e) => setCandidateAddr(e.target.value)}
            placeholder="0x..."
          />

          <Label>Candidate Name</Label>
          <Input
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Candidate's name"
          />

          <Button 
            onClick={handleRegisterCandidate} 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Registering..." : "Register Candidate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

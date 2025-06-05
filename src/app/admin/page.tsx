// app/admin/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import ConnectWallet from "../components/allPage/ConnectWallet";

export default function AdminPage() {
  const [sessionId, setSessionId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [candidateAddr, setCandidateAddr] = useState("");
  const [candidateName, setCandidateName] = useState("");

  async function createSession() {
    const res = await fetch("/api/admin/session", {
      method: "POST",
      body: JSON.stringify({ sessionId, startTime, endTime }),
    });
    if (res.ok) toast.success("Session created successfully");
    else toast.error("Failed to create session");
  }

  async function registerCandidate() {
    const res = await fetch("/api/admin/candidate", {
      method: "POST",
      body: JSON.stringify({ sessionId, candidateAddr, candidateName }),
    });
    if (res.ok) toast.success("Candidate registered");
    else toast.error("Failed to register candidate");
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
          />

          <Label>Start Time (unix timestamp)</Label>
          <Input
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <Label>End Time (unix timestamp)</Label>
          <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} />

          <Button onClick={createSession}>Create Voting Session</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Label>Candidate Address</Label>
          <Input
            value={candidateAddr}
            onChange={(e) => setCandidateAddr(e.target.value)}
          />

          <Label>Candidate Name</Label>
          <Input
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />

          <Button onClick={registerCandidate}>Register Candidate</Button>
        </CardContent>
      </Card>
    </div>
  );
}

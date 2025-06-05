"use client";

import Voting from "./components/voting/Voting";

import { useState } from "react";

export default function Home() {
  const [sessionId] = useState<string>("1");
  return (
    <>
      <Voting sessionId={sessionId} />
    </>
  );
}

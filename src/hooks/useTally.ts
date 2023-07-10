import { useState } from "react";

export function useTally() {
  const [tally, setTally] = useState(0);

  function incrementTally() {
    setTally((prev) => prev + 1);
  }

  function resetTally() {
    setTally(0);
  }

  return { tally, incrementTally, resetTally };
}

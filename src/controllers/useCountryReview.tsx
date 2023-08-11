import { useState } from "react";

export function useCountryReview() {
  const [isRandomReviewMode, setRandomReviewMode] = useState(false);

  return {
    isRandomReviewMode,
    setRandomReviewMode,
  };
}

import { useQuery } from "@tanstack/react-query";

import { type EdgeKeys } from "netlify/edge-functions/keys";

export function useEdgeKeys() {
  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      const { text, status } = await fetch("/api/keys");

      if (status === 403) throw new Error("Unauthorized");

      const payload = await text();

      if (payload.length > 0) return JSON.parse(payload) as EdgeKeys;
      return undefined;
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Unauthorized") return false;
      else return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
}

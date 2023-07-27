import { useQuery } from "@tanstack/react-query";

import { type EdgeKeys } from "netlify/edge-functions/keys";

export function useEdgeKeys() {
  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => {
      const response = await fetch("/api/keys");

      if (!response.ok) throw new Error("Failed to fetch keys.");

      const payload = await response.text();

      if (payload.length > 0) return JSON.parse(payload) as EdgeKeys;
      return undefined;
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

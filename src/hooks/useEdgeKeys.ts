import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { type EdgeKeys } from "netlify/edge-functions/keys";

export function useEdgeKeys() {
  return useQuery({
    queryKey: ["keys"],
    queryFn: async () => axios.get("/api/keys").then((res) => res.data as EdgeKeys),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Unauthorized") return false;
      else return failureCount < 2;
    },
    throwOnError(error) {
      if (error instanceof AxiosError && error.response?.status !== undefined) return error.response.status >= 500;
      else return false;
    },
    refetchOnWindowFocus: false,
    staleTime: 86_400, // 24 hours
  });
}

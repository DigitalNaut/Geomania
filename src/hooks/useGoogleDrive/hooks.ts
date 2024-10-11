import type { NonOAuthError } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";

import type { ConditionalHookProps, DriveState } from "./types";
import { discoveryDocs, scope } from "./defaults";

export function ImplicitFlow({ callback, onSuccess, onError }: ConditionalHookProps) {
  callback.current = useGoogleLogin({
    prompt: "",
    scope,
    onSuccess,
    onError,
    onNonOAuthError: onError,
  });

  return null;
}

export function useDriveState() {
  const [state, setState] = useState<DriveState>({ status: "idle", loaded: false });

  const raiseError = (error: Error | NonOAuthError) =>
    void setState((prevState) => ({
      status: "error",
      loaded: prevState.loaded,
      error,
    }));

  const changeStatus = (newStatus: (DriveState & { loaded: true; error: undefined })["status"]) => {
    const { status } = state;

    if (status === newStatus) return;

    if (
      (status === "idle" && newStatus !== "loaded") ||
      (status === "loaded" && newStatus !== "unauthorized") ||
      (status === "unauthorized" && newStatus !== "access") ||
      (status === "access" && newStatus !== "loaded")
    ) {
      raiseError(new Error(`Invalid state transition from ${state} to ${newStatus}`));
    }

    setState({ status: newStatus, loaded: true });
  };

  return { state, changeStatus, raiseError };
}

export async function loadGapiScripts() {
  return new Promise((resolve) => {
    gapi.load("client", resolve);
  });
}

export async function initGapiClient(apiKey?: string) {
  return gapi.client.init({ apiKey, discoveryDocs });
}

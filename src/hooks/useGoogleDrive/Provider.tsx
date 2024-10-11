import type { NonOAuthError, TokenResponse } from "@react-oauth/google";
import { hasGrantedAnyScopeGoogle, useGoogleOAuth } from "@react-oauth/google";
import type { PropsWithChildren } from "react";
import { useRef, useState } from "react";

import { Script } from "src/components/common/Script";
import { scope } from "./defaults";
import type { DriveAccessValidator } from "./types";
import { ImplicitFlow, initGapiClient, loadGapiScripts, useDriveState } from "./hooks";
import { Provider } from ".";

/**
 * Provides a Google Drive API context for child components. Children components can access the
 * Google Drive API functionality by calling methods on the `googleDriveContext` object.
 * To use this context:
 * 1. Wrap your component tree with this provider.
 * 2. Then use the `useGoogleDrive` hook to request access to Google Drive.
 * 3. Finally call the methods on the `useGoogleDrive` hook to use the API.
 */
export function GoogleDriveProvider({
  children,
  apiKey,
  onUserDisconnect,
}: PropsWithChildren<{
  apiKey?: string;
  onUserDisconnect?: () => void;
}>) {
  const { state, changeStatus, raiseError } = useDriveState();
  const { status } = state;
  const initDriveImplicitFlow = useRef<() => void>(() => null);

  const [userDriveTokens, setUserTokens] = useState<TokenResponse>();
  const [tokensExpirationDate, setTokensExpirationDate] = useState<Date>();

  const { scriptLoadedSuccessfully } = useGoogleOAuth();

  async function handleGapiLoaded() {
    if (status !== "idle") return;

    try {
      await loadGapiScripts();
      await initGapiClient(apiKey);
      changeStatus("loaded");
    } catch (error) {
      if (error instanceof Error) raiseError(error);
      else raiseError(new Error("An unknown error occurred."));
    }
  }

  function setTokensAndAccess(newTokens: TokenResponse) {
    setTokensExpirationDate(new Date(Date.now() + newTokens.expires_in * 1000));
    setUserTokens(newTokens);
  }

  function clearTokensAndAccess() {
    setUserTokens(undefined);
  }

  function requestDriveAccess() {
    if (status !== "loaded") return;

    changeStatus("unauthorized");

    clearTokensAndAccess();
    initDriveImplicitFlow.current();
  }

  function onSuccess(tokenResponse: TokenResponse) {
    if (hasGrantedAnyScopeGoogle(tokenResponse, scope)) {
      setTokensAndAccess(tokenResponse);
      changeStatus("access");
    } else {
      clearTokensAndAccess();
      raiseError(new Error("Unauthorized."));
    }
  }

  function onError(errorResponse: NonOAuthError | Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
    if ("type" in errorResponse) raiseError(errorResponse);
    else raiseError(new Error(errorResponse.error_description));

    clearTokensAndAccess();
  }

  function validateDriveAccess(): DriveAccessValidator {
    let errorMessage = "";

    if (status !== "access") {
      errorMessage = "No access.";
    } else if (!userDriveTokens) {
      clearTokensAndAccess();
      errorMessage = "User not authenticated.";
    } else if (!tokensExpirationDate || new Date() > tokensExpirationDate) {
      clearTokensAndAccess();
      errorMessage = "Session expired.";
    }

    if (errorMessage) return { hasAccess: false, error: new Error(errorMessage) };

    return { hasAccess: true };
  }

  function disconnectDrive() {
    if (status !== "access") return;

    changeStatus("loaded");

    clearTokensAndAccess();
    onUserDisconnect?.();
  }

  return (
    <Provider value={{ validateDriveAccess, requestDriveAccess, disconnectDrive, state, userDriveTokens }}>
      <Script src="https://apis.google.com/js/api.js" onLoad={handleGapiLoaded} />

      {scriptLoadedSuccessfully && apiKey && (
        <ImplicitFlow callback={initDriveImplicitFlow} onSuccess={onSuccess} onError={onError} />
      )}

      {children}
    </Provider>
  );
}

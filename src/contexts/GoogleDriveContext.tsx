import { type MutableRefObject, type PropsWithChildren, useState, createContext, useContext, useRef } from "react";
import {
  type NonOAuthError,
  type TokenResponse,
  useGoogleLogin,
  hasGrantedAnyScopeGoogle,
  useGoogleOAuth,
} from "@react-oauth/google";

import { Script } from "src/components/common/Script";

type DriveAccessValidator = { hasAccess: true; error: undefined } | { hasAccess: false; error: Error };

type DriveState = "idle" | "loaded" | "authorizing" | "access" | "error";

type GoogleDriveContextType = {
  requestDriveAccess(): void;
  disconnectDrive(): void;
  validateDriveAccess(): DriveAccessValidator;
  state: DriveState;
  userDriveTokens?: TokenResponse;
  error: Error | NonOAuthError | null;
};

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

// See: https://developers.google.com/identity/protocols/oauth2/scopes#drive
const scope = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const discoveryDocs = [DISCOVERY_DOC];

type ConditionalHookProps = {
  callback: MutableRefObject<() => void>;
  onSuccess?: (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => void;
  onError?: (errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) => void;
  onNonOAuthError?: (nonOAuthError: NonOAuthError) => void;
};

function ImplicitFlow({ callback, onNonOAuthError, onSuccess, onError }: ConditionalHookProps) {
  callback.current = useGoogleLogin({
    prompt: "",
    scope,
    onNonOAuthError,
    onSuccess,
    onError,
  });

  return null;
}

function useDriveStateMachine() {
  const [state, setState] = useState<DriveState>("idle");
  const [error, setError] = useState<Error | NonOAuthError | null>(null);

  const changeState = (newState: DriveState, error: Error | NonOAuthError | null = null) => {
    if (
      state !== newState &&
      ((state === "idle" && newState !== "loaded") ||
        (state === "loaded" && newState !== "authorizing") ||
        (state === "authorizing" && newState !== "access") ||
        (state === "access" && newState !== "loaded"))
    ) {
      error = new Error(`Invalid state transition from ${state} to ${newState}`);
    }

    setState(newState);
    setError(error);
  };

  return { state, changeState, error, setError };
}

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
  const { state, changeState, error, setError } = useDriveStateMachine();
  const initDriveImplicitFlow = useRef<() => void>(() => null);

  const [userDriveTokens, setUserTokens] = useState<TokenResponse>();
  const [tokensExpirationDate, setTokensExpirationDate] = useState<Date>();

  const { scriptLoadedSuccessfully } = useGoogleOAuth();

  async function loadGapiScripts() {
    return new Promise((resolve) => {
      gapi.load("client", resolve);
    });
  }

  async function initGapiClient() {
    return gapi.client.init({ apiKey, discoveryDocs });
  }

  async function handleGapiLoaded() {
    if (state !== "idle") return;

    try {
      changeState("idle");
      await loadGapiScripts();
      await initGapiClient();
      changeState("loaded");
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));

      changeState("error");
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
    if (state !== "loaded") return;

    setError(null);
    changeState("authorizing");

    clearTokensAndAccess();
    initDriveImplicitFlow.current();
  }

  function disconnectDrive() {
    if (state !== "access") return;

    setError(null);
    changeState("loaded");

    clearTokensAndAccess();
    onUserDisconnect?.();
  }

  function validateDriveAccess(): DriveAccessValidator {
    let errorMessage = "";

    if (state !== "access") {
      errorMessage = "No access.";
    } else if (!userDriveTokens) {
      clearTokensAndAccess();
      errorMessage = "User not authenticated.";
    } else if (!tokensExpirationDate || new Date() > tokensExpirationDate) {
      clearTokensAndAccess();
      errorMessage = "Session expired.";
    } else if (!hasGrantedAnyScopeGoogle(userDriveTokens, scope)) {
      errorMessage = "Unauthorized.";
    }

    if (errorMessage) return { hasAccess: false, error: new Error(errorMessage) };

    return { hasAccess: true, error: undefined };
  }

  function onSuccess(tokenResponse: TokenResponse) {
    setError(null);

    if (hasGrantedAnyScopeGoogle(tokenResponse, scope)) {
      setTokensAndAccess(tokenResponse);
      changeState("access");
    } else {
      clearTokensAndAccess();
      changeState("error");
      setError(new Error("Unauthorized."));
    }
  }

  function onNonOAuthError(error: NonOAuthError) {
    setError(error);

    clearTokensAndAccess();
    changeState("error");
  }

  function onError(errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
    setError(new Error(errorResponse.error_description));

    clearTokensAndAccess();
    changeState("error");
  }

  return (
    <googleDriveContext.Provider
      value={{ validateDriveAccess, requestDriveAccess, disconnectDrive, state, userDriveTokens, error }}
    >
      <Script src="https://apis.google.com/js/api.js" onLoad={handleGapiLoaded} />
      {scriptLoadedSuccessfully && apiKey && (
        <ImplicitFlow
          callback={initDriveImplicitFlow}
          onSuccess={onSuccess}
          onError={onError}
          onNonOAuthError={onNonOAuthError}
        />
      )}
      {children}
    </googleDriveContext.Provider>
  );
}

export function useGoogleDriveContext() {
  const context = useContext(googleDriveContext);

  if (!context) throw new Error("useGoogleDrive must be used within a GoogleDriveProvider");

  return context;
}
